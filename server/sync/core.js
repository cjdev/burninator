import Promise from 'bluebird';
import * as R from 'ramda';
import moment from 'moment';
import jira from './jira';
import { logger } from '../logger';
import { debugSprint, debugSprints, findSprintById } from './sprint';

var mapIndex = R.addIndex(R.map);

const getReleaseBlocks = allIssues => {
  const ctx = '[getReleaseBlocks]';
  const groupedByVersion = R.groupBy(i => i.version, allIssues);
  const groupStats = R.keys(groupedByVersion).reduce(
    (stats, curr) =>
      R.assoc(curr, groupedByVersion[curr].reduce((sum, i) => sum + i.points, 0), stats),
    {}
  );

  const blocks = allIssues
    .filter(issue => /RELEASE BLOCK/.test(issue.summary))
    .map((issue, i) => ({
      ordinal: i + 1,
      name: issue.version,
      points: groupStats[issue.version],
    }));
  logger.silly(ctx, blocks);
  return blocks;
};

const byState = R.propEq('state');

const splitSprints = allSprints => ({
  activeSprint: R.head(R.filter(byState('active'))(allSprints)),
  closedSprints: R.filter(byState('closed'))(allSprints),
});

const getStartOfEarliestSprint = R.pipe(
  R.pluck('startDate'),
  R.sort((a, b) => a.valueOf() - b.valueOf()),
  R.head
);

const debugIssues = (prefix, issues) => {
  logger.silly(prefix);
  R.forEach(i => logger.silly(i.key, ':', i.jiraOrder, i.status.name, '//', i.summary))(issues);
};

export const stati = [
  'Closed',
  'Resolved',
  'Needs SOX',
  'Needs Demo',
  'Needs QR',
  'Dev Done',
  'In Progress',
  'Open',
];

const statusProp = R.view(R.lensPath(['status', 'name']));
const byStatus = issue => R.findIndex(R.equals(statusProp(issue)))(stati);

const getResolutionDate = R.view(R.lensPath(['resolution', 'date']));
const byResDate = dateStr => (dateStr ? moment(dateStr).valueOf() : 0);
const byResolutionDate = issue => byResDate(getResolutionDate(issue));

export const combineAllIssues = (activeSprint, backlogIssues) => {
  if (!activeSprint || !activeSprint.issues) return backlogIssues;

  debugIssues('active sprint', activeSprint.issues);
  const sorted = R.pipe(
    mapIndex((issue, jiraOrder) => ({
      ...issue,
      jiraOrder,
      inActiveSprint: true,
    })),
    R.sortWith([R.ascend(byStatus), R.ascend(byResolutionDate), R.ascend(R.prop('jiraOrder'))]),
    R.concat(R.__, backlogIssues) // eslint-disable-line no-underscore-dangle
  )(activeSprint.issues);

  debugIssues('sorted', sorted);
  return sorted;
};

const newOrChangedSprint = (sprint, { sprints: existingSprints }) => {
  const ctx = `[newOrChangedSprint: ${sprint.id}]`;
  logger.silly(ctx, '----------------------------------------------------------');
  logger.silly(ctx, debugSprint(sprint));

  if (sprint.state !== 'closed') {
    logger.silly(ctx, `sprint state !== closed (${sprint.state})`);
    return sprint;
  }

  const existingSprint = findSprintById(sprint.id)(existingSprints);
  logger.silly(ctx, 'found?', R.not(R.isNil(existingSprint)));

  if (R.isNil(existingSprint)) {
    logger.silly(ctx, 'no existing sprint found');
    return sprint;
  }
  if (existingSprint.state !== sprint.state) {
    logger.silly(ctx, `existing sprint state change ${existingSprint.state} => ${sprint.state}`);
    return sprint;
  }
  logger.silly(ctx, 'found and closed and same state - filtering out - no update');
  return null;
};

export const mergeSprints = (existingSprints, newSprints) => {
  const ctx = '[mergeSprints]';
  logger.silly(ctx, 'existingsprints', debugSprints(existingSprints));
  if (R.isNil(existingSprints) || existingSprints.length === 0) {
    logger.debug('no existing sprints... returning updated');
    return newSprints;
  }

  const updatedExisting = R.reduce(
    (acc, sprint) => {
      const updated = findSprintById(sprint.id)(newSprints);
      // if (updated) { logger.debug(ctx, 'adding updated sprint', debugSprint(updated)); }
      // else { logger.debug(ctx, 'adding existing sprint', debugSprint(sprint)); }
      acc.push(updated || sprint);
      return acc;
    },
    [],
    existingSprints
  );

  const merged = R.reduce(
    (acc, sprint) => {
      const existingSprint = findSprintById(sprint.id)(acc);
      if (!existingSprint) {
        acc.push(sprint);
      }
      return acc;
    },
    updatedExisting,
    newSprints
  );

  logger.silly(ctx, 'merged', debugSprints(merged));
  return merged;
};

export const sync = async (opts, existing, syncUpdate = () => {}) => {
  const ctx = '[sync]';
  const start = moment();

  const existingBoardData = existing || { sprints: [] };
  logger.silly(ctx, 'existingBoardData', existingBoardData);

  const boardId = parseInt(opts.boardId, 10);

  syncUpdate('getting backlog...');
  const backlog = await jira.getBacklog(boardId, opts);
  logger.debug(ctx, 'backlog', JSON.stringify(backlog));

  syncUpdate('getting backlog issues...');
  const backlogIssues = await jira.getBacklogIssues(boardId, opts, syncUpdate);
  logger.debug(ctx, 'backlogIssues:', backlogIssues.length);

  syncUpdate('getting all sprints...');
  const allSprints = await jira.getAllSprints(boardId, opts, syncUpdate);
  logger.debug('allSprints', allSprints.length);

  syncUpdate('getting all releases...');
  const allJiraVersions = await jira.getAllJiraVersions(boardId, opts, syncUpdate);
  logger.debug('allJiraVersions', allJiraVersions.length);

  const filteredSprints = R.pipe(
    R.filter(R.propEq('originBoardId', boardId)),
    R.filter(s => newOrChangedSprint(s, existingBoardData))
  )(allSprints);

  syncUpdate('getting updated sprints...');
  const updatedSprints = await Promise.map(
    filteredSprints,
    async sprint => await jira.getSprintWithIssues(sprint, opts, syncUpdate),
    { concurrency: 1 }
  );
  logger.silly('updatedSprints', debugSprints(updatedSprints));

  const mergedSprints = mergeSprints(existingBoardData.sprints, updatedSprints);
  logger.debug(`mergedSprints: ${mergedSprints.length}`);
  logger.silly(`merged: ${JSON.stringify(debugSprints(mergedSprints))}`);

  const { activeSprint } = splitSprints(mergedSprints);
  logger.debug(
    `ctx: ${ctx} active sprint ${activeSprint ? JSON.stringify(debugSprint(activeSprint)) : 'none'}`
  );

  const allIssues = combineAllIssues(activeSprint, backlogIssues);
  logger.info(`allIssues.length: ${allIssues.length}`);

  const data = {
    lastUpdate: Date.now(),
    startDate: getStartOfEarliestSprint(mergedSprints),
    backlogName: backlog.name,
    releaseBlocks: getReleaseBlocks(allIssues),
    sprints: mergedSprints,
    allIssues,
    allJiraVersions,
  };

  logger.info(ctx, 'velocity       ', data.velocity);
  logger.info(ctx, 'release blocks ', R.keys(data.releaseBlocks).length);
  logger.info(ctx, 'sprints        ', mergedSprints.length);
  logger.info(ctx, 'issues         ', allIssues.length);
  logger.info(ctx, '...done.');
  logger.info(ctx, 'about to write', `${moment.duration(moment().diff(start)).asSeconds()} `);

  return data;
};
