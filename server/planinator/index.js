import path from 'path';
import * as R from 'ramda';
import opts from '../opts';

import { logger, jtos } from '../logger';
import { PlanDatabase } from './PlanDatabase';
import uuid from 'uuid/v4';
// import { diff } from 'deep-object-diff';
import { getBoard } from '../handlers';
import Board from '../../src/domain/Board';

const planDir = path.resolve(opts.dataDir, 'plan');
const db = PlanDatabase(planDir);

export const handlePutPlan = async (req, res) => {
  try {
    //TODO input validation on body
    //
    logger.warn(JSON.stringify(req.params), JSON.stringify(req.body, null, 1));
    await db.putPlan(req.params.planId, req.body);
    return res.status(200).send('OK');
  } catch (err) {
    logger.error(err.message);
    res.status(500).send('Internal Server Error');
  }
};

///////////////////////////////////////////////////////////////////////////////
//
const toTs = dateStr => new Date(dateStr).getTime();
const sortByTs = (a, b) => a.startDate - b.startDate;
const releaseIdLens = R.view(R.lensPath(['versionObj', 'id']));

const getStartDate = (board, releaseId) => {
  // get the start date of the release:
  //   1. find the first story of the release
  //   2. find the end date of the previous story
  const ordinalOfPrevious = R.pipe(
    R.filter(i => releaseIdLens(i) === releaseId),
    R.pluck('ordinal'),
    R.head,
    R.dec
  )(board.enhancedIssueList);
  const previous = board.enhancedIssueList[Math.max(ordinalOfPrevious, 0)];

  if (!previous) {
    console.error('getStartDate: no previous issue!', board.boardId, releaseId, ordinalOfPrevious);
    return 0;
  }

  // stories that are done have a completedWeekPadded of ''.
  // fall back to completedWeek
  return !!previous.completedWeekPadded
    ? toTs(previous.completedWeekPadded)
    : toTs(previous.completedWeek);
};

const getEndDate = (board, releaseId) => {
  const lastInRelease = R.pipe(
    R.filter(i => releaseIdLens(i) === releaseId),
    R.last
  )(board.enhancedIssueList);
  if (!lastInRelease) {
    console.error('getEndDate: no last issue!', board.boardId, releaseId, lastInRelease);
    return 0;
  }

  // stories that are done have a completedWeekPadded of ''.
  // fall back to completedWeek
  return !!lastInRelease.completedWeekPadded
    ? toTs(lastInRelease.completedWeekPadded)
    : toTs(lastInRelease.completedWeek);
};

export const handleGetPlan = async (req, res) => {
  logger.silly('req: ', jtos(req.params));
  try {
    const planData = await db.getPlan(req.params.planId, req.params.version);
    // logger.warn('...start planData....................................');
    // logger.debug(planData);
    // logger.warn('...end planData....................................');

    // for each track that is associated with a board,
    // ---- ( note the board)
    // ---- find 'build' projects
    //      ---- find children with a 'releaseId'
    //           ---- foreach child release:
    //                --- calculate the start date:
    //                    - find the first story in the release R
    //                    - find the story before that one R-1
    //                    - take the outside end date of R-1
    //                --- calculate the end date
    //                    - outside date of the last story in the release
    //
    // There is probably a cleaner, more functional impl of this.

    const pd = JSON.parse(planData);

    const finalTracks = R.map(async track => {
      if (!track.board) return track;
      const boardData = await getBoard(track.board);
      const board = new Board(track.board, boardData);

      const newProjects = R.map(project => {
        if (project.phase !== 'build') return project;

        const newChildren = R.pipe(
          R.map(child => {
            if (!child.releaseId) return child;
            return {
              ...child,
              startDate: getStartDate(board, child.releaseId),
              endDate: getEndDate(board, child.releaseId),
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
    })(pd.tracks || []);

    const final = {
      ...pd,
      tracks: await Promise.all(finalTracks),
    };

    // console.log('final: ', final);
    // console.log('EQUAL', R.equals(pd, final));
    // console.log('DIFF ', diff(pd, final));

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

// // TEMP
// handleGetPlan(
//   {
//     params: {
//       planId: '1',
//     },
//   },
//   {
//     json: () => {},
//     status: () => {
//       return {
//         send: () => {},
//       };
//     },
//   }
// );
