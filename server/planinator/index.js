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

const t = s => new Date(s).getTime();

// eslint-disable-next-line  no-unused-vars
const ppp = {
  settings: {
    name: 'Q1 2019 CJ Proposed Plan: Option #1',
    startDate: t('2018-10-01Z'),
    endDate: t('2025-03-01Z'),
    monthWidthPx: 120,
  },
  tracks: [
    // {
    //   id: uuid(),
    //   name: 'fhenderson',
    //   projects: [
    //     {
    //       id: uuid(),
    //       name: 'Completed #1',
    //       phase: 'complete',
    //       startDate: t('2018-10-03Z'),
    //       endDate: t('2019-02-15Z'),
    //     },
    //     {
    //       id: uuid(),
    //       name: 'Planinator',
    //       phase: 'build',
    //       children: [
    //         {
    //           id: uuid(),
    //           type: 'release',
    //           phase: 'complete',
    //           name: 'A Scrolling Timeline',
    //           startDate: t('2019-02-25Z'),
    //           endDate: t('2019-03-05Z'),
    //         },
    //         {
    //           id: uuid(),
    //           type: 'release',
    //           phase: 'build',
    //           name: 'Better with non-Jira data',
    //           startDate: t('2019-03-06Z'),
    //           endDate: t('2019-04-26Z'),
    //         },
    //         {
    //           id: uuid(),
    //           type: 'release',
    //           phase: 'build',
    //           name: 'Can Read from Jira',
    //           startDate: t('2019-04-27Z'),
    //           endDate: t('2019-06-15Z'),
    //         },
    //         {
    //           id: uuid(),
    //           type: 'release',
    //           phase: 'launch',
    //           name: 'Doh! Self Serve',
    //           startDate: t('2019-06-16Z'),
    //           endDate: t('2019-07-26Z'),
    //         },
    //       ],
    //     },
    //     {
    //       id: uuid(),
    //       name: 'Member-web Upgrades',
    //       phase: 'design',
    //       startDate: t('2019-07-20Z'),
    //       endDate: t('2019-09-31Z'),
    //     },
    //     {
    //       id: uuid(),
    //       name: 'Mastery Server',
    //       phase: 'assess',
    //       startDate: t('2019-09-01Z'),
    //       endDate: t('2019-10-01Z'),
    //     },
    //   ],
    // },
    {
      id: uuid(),
      name: 'Ad Systems',
      board: 436,
      // projects: [
      //   {
      //     id: uuid(),
      //     name: 'Product Search',
      //     phase: 'build',
      //     children: [
      //       {
      //         releaseId: '50367',
      //         phase: 'build',
      //         id: uuid(),
      //       },
      //       {
      //         releaseId: '50366',
      //         phase: 'build',
      //         id: uuid(),
      //       },
      //       {
      //         releaseId: '50368',
      //         phase: 'build',
      //         id: uuid(),
      //       },
      //     ],
      //   },
      // ],
    },
    { id: uuid(), name: 'Compliance' },
    { id: uuid(), name: 'Customer Insights' },
    { id: uuid(), name: 'Engagement' },
    { id: uuid(), name: 'FinTech' },
    { id: uuid(), name: 'Insights' },
    { id: uuid(), name: 'Personalization' },
    { id: uuid(), name: 'Platform' },
    { id: uuid(), name: 'Relationships' },
    { id: uuid(), name: 'Tracking' },
  ],
};
// console.log('ppp: ', ppp);

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

export const handleResetPlan = async (req, res) => {
  await db.putPlan('1', ppp);
  return res.status(200).send('OK');
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
