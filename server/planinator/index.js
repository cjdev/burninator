import path from 'path';
import opts from '../opts';
import { logger, jtos } from '../logger';
import { PlanDatabase } from './PlanDatabase';

const planDir = path.resolve(opts.dataDir, 'plan');
const db = PlanDatabase(planDir);

// const ppp = {
//   settings: {
//     startDate: '2018-10-01Z',
//     endDate: '2025-03-01Z',
//     monthWidthPx: 120,
//   },
//   tracks: [
//     {
//       name: 'fhenderson',
//       projects: [
//         {
//           name: 'Completed #1',
//           phase: 'complete',
//           startDate: '2018-10-03Z',
//           endDate: '2019-02-15Z',
//         },
//         {
//           name: 'Planinator',
//           phase: 'build',
//           children: [
//             {
//               type: 'release',
//               phase: 'complete',
//               name: 'A Scrolling Timeline',
//               startDate: '2019-02-25Z',
//               endDate: '2019-03-05Z',
//             },
//             {
//               type: 'release',
//               phase: 'build',
//               name: 'Better with non-Jira data',
//               startDate: '2019-03-06Z',
//               endDate: '2019-04-26Z',
//             },
//             {
//               type: 'release',
//               phase: 'build',
//               name: 'Can Read from Jira',
//               startDate: '2019-04-27Z',
//               endDate: '2019-06-15Z',
//             },
//             {
//               type: 'release',
//               phase: 'launch',
//               name: 'Doh! Self Serve',
//               startDate: '2019-06-16Z',
//               endDate: '2019-07-26Z',
//             },
//           ],
//         },
//         {
//           name: 'Member-web Upgrades',
//           phase: 'design',
//           startDate: '2019-07-20Z',
//           endDate: '2019-09-31Z',
//         },
//         {
//           name: 'Mastery Server',
//           phase: 'assess',
//           startDate: '2019-09-01Z',
//           endDate: '2019-10-01Z',
//         },
//       ],
//     },
//     {
//       name: 'Ad Systems',
//       projects: [],
//     },
//     { name: 'Compliance' },
//     { name: 'FinTech' },
//     { name: 'Relationships' },
//     { name: 'Platform' },
//     { name: 'Insights' },
//     { name: 'Customer Insights' },
//     { name: 'Personalization' },
//     { name: 'Engagement' },
//     { name: 'Tracking' },
//   ],
// };

/**
 * Plans
 *
 * Accomodate a future with multiple plans:
 *
 *******************************
plan/
  globalsettings(?)
  plans/
    <planId:1>/
      planSettings(?)
      versions/
        <version:1>
        <version:2>
        ...
    <planId:2>/
      planSettings(?)
      versions/
        <version:1>
        <version:2>
        ...
 *******************************
 *
 *
 *
 */

export const handlePutPlan = async (req, res) => {
  //TODO input validation on body
  //
  logger.warn(JSON.stringify(req.params), req.body);
  setTimeout(() => {
    return res.status(200).send('OK');
  }, 2000);
  // await db.putPlan(req.params.planId, req.body);
};

export const handleGetPlan = async (req, res) => {
  logger.silly('req: ', jtos(req.params));
  // db.putPlan(req.params.planId, ppp);
  try {
    const planData = await db.getPlan(req.params.planId, req.params.version);
    logger.silly(planData);
    res.json(JSON.parse(planData));
  } catch (err) {
    logger.error(err.message);
    if (err.message === 'Not found') {
      res.status(404).send('Not found');
      return;
    }
    res.status(500).send('Internal Server Error');
  }
};
