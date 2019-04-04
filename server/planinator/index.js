import path from 'path';
import * as R from 'ramda';
import opts from '../opts';

import { logger } from '../logger';
import { PlanDatabase } from './PlanDatabase';
import { getBoard } from '../handlers';
import Board from '../../src/domain/Board';

const planDir = path.resolve(opts.dataDir, 'plan');
const db = PlanDatabase(planDir);

const toTs = maybeDateString => (maybeDateString ? new Date(maybeDateString).getTime() : 0);
const sortByTs = (a, b) => a.startDate - b.startDate;

export const handlePutPlan = async (req, res) => {
  try {
    //TODO input validation on body
    logger.warn(JSON.stringify(req.params), JSON.stringify(req.body, null, 1));
    await db.putPlan(req.params.planId, req.body);
    return res.status(200).send('OK');
  } catch (err) {
    logger.error(err.message);
    res.status(500).send('Internal Server Error');
  }
};

const enhanceTracks = tracks => {
  const finalTracks = R.map(async track => {
    if (!track.board) return track;
    const boardData = await getBoard(track.board);
    const board = new Board(track.board, boardData);

    const finalVersionDates = board.getReleases();
    // console.log(finalVersionDates);

    const newProjects = R.map(project => {
      if (project.phase !== 'build') return project;

      const newChildren = R.pipe(
        R.map(child => {
          if (!child.releaseId) return child;
          return {
            ...child,
            startDate: toTs(finalVersionDates[child.releaseId].startDate),
            endDate: toTs(finalVersionDates[child.releaseId].endDate),
          };
        }),
        R.sort(sortByTs)
      )(project.children || []);

      return {
        ...project,
        children: newChildren,
      };
    })(track.projects || []);
    return {
      ...track,
      projects: newProjects,
    };
  })(tracks || []);
  return Promise.all(finalTracks);
};

export const handleGetPlan = async (req, res) => {
  try {
    const planData = await db.getPlan(req.params.planId, req.params.version);
    const pd = JSON.parse(planData);
    const tracks = await enhanceTracks(pd.tracks);

    const final = {
      ...pd,
      tracks,
    };

    // console.log('----------------------------------------------- final: ', final);
    res.json(final);
  } catch (err) {
    logger.error(err);
    if (err.message === 'Not found') {
      res.status(404).send('Not found');
      return;
    }
    res.status(500).send('Internal Server Error');
  }
};

// TEMP
handleGetPlan(
  { params: { planId: '1' } },
  {
    json: () => {},
    status: () => {
      return {
        send: () => {},
      };
    },
  }
);
