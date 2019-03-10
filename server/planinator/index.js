import path from 'path';
import opts from '../opts';
import { logger, jtos } from '../logger';
import { PlanDatabase } from './PlanDatabase';
import uuid from 'uuid/v4';

const planDir = path.resolve(opts.dataDir, 'plan');
const db = PlanDatabase(planDir);

const t = s => new Date(s).getTime();

// eslint-disable-next-line  no-unused-vars
const ppp = {
  settings: {
    name: 'Plan #1',
    startDate: t('2018-10-01Z'),
    endDate: t('2025-03-01Z'),
    monthWidthPx: 120,
  },
  tracks: [
    {
      id: uuid(),
      name: 'fhenderson',
      projects: [
        {
          id: uuid(),
          name: 'Completed #1',
          phase: 'complete',
          startDate: t('2018-10-03Z'),
          endDate: t('2019-02-15Z'),
        },
        {
          id: uuid(),
          name: 'Planinator',
          phase: 'build',
          children: [
            {
              id: uuid(),
              type: 'release',
              phase: 'complete',
              name: 'A Scrolling Timeline',
              startDate: t('2019-02-25Z'),
              endDate: t('2019-03-05Z'),
            },
            {
              id: uuid(),
              type: 'release',
              phase: 'build',
              name: 'Better with non-Jira data',
              startDate: t('2019-03-06Z'),
              endDate: t('2019-04-26Z'),
            },
            {
              id: uuid(),
              type: 'release',
              phase: 'build',
              name: 'Can Read from Jira',
              startDate: t('2019-04-27Z'),
              endDate: t('2019-06-15Z'),
            },
            {
              id: uuid(),
              type: 'release',
              phase: 'launch',
              name: 'Doh! Self Serve',
              startDate: t('2019-06-16Z'),
              endDate: t('2019-07-26Z'),
            },
          ],
        },
        {
          id: uuid(),
          name: 'Member-web Upgrades',
          phase: 'design',
          startDate: t('2019-07-20Z'),
          endDate: t('2019-09-31Z'),
        },
        {
          id: uuid(),
          name: 'Mastery Server',
          phase: 'assess',
          startDate: t('2019-09-01Z'),
          endDate: t('2019-10-01Z'),
        },
      ],
    },
    {
      id: uuid(),
      name: 'Ad Systems',
      projects: [],
    },
    { id: uuid(), name: 'Compliance' },
    { id: uuid(), name: 'FinTech' },
    { id: uuid(), name: 'Relationships' },
    { id: uuid(), name: 'Platform' },
    { id: uuid(), name: 'Insights' },
    { id: uuid(), name: 'Customer Insights' },
    { id: uuid(), name: 'Personalization' },
    { id: uuid(), name: 'Engagement' },
    { id: uuid(), name: 'Tracking' },
  ],
};

// console.log('ppp: ', ppp);
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
