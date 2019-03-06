import Promise from 'bluebird'; // eslint-disable-line no-unused-vars
import axios from 'axios';
import moment from 'moment';
import * as R from 'ramda';
import { logger } from '../logger';
import { toIssues } from './issue';
import opts from '../opts';

const jiraAgileURL = `${opts.JIRA_ROOT_URL}/rest/agile/latest`;

export const storyPointsField = 'customfield_10002';

const boardInfoForBoard = boardId => `${jiraAgileURL}/board/${boardId}`;

const backlogIssuesForBoard = boardId =>
  `${jiraAgileURL}/board/${boardId}/backlog?startAt=0&maxResults=1000&expand=names,renderedFields,changelog`;

const sprintsForBoard = (boardId, startAt) =>
  `${jiraAgileURL}/board/${boardId}/sprint?startAt=${startAt}&maxResults=1000`;

const jiraVersionsForBoard = (boardId, startAt) =>
  `${jiraAgileURL}/board/${boardId}/version?startAt=${startAt}&maxResults=1000`;

const issuesForSprint = sprint =>
  `${jiraAgileURL}/board/${sprint.originBoardId}/sprint/${
    sprint.id
  }/issue?startAt=0&maxResults=100&expand=names,renderedFields,changelog`;

const logUrl = (cxt, url) => {
  logger.debug(cxt, url);
  return url;
};

const getJSON = async (ctx, url, opts) => await axios.get(logUrl(ctx, url), opts);

const getBacklog = async (boardId, opts) => {
  const ctx = '[getBacklog2]';
  try {
    const {
      data: { name },
    } = await getJSON(ctx, boardInfoForBoard(boardId), opts);
    logger.debug(ctx, boardId, name);
    return { name };
  } catch (err) {
    logger.error(err);
  }
  return null;
};

const getBacklogIssues = async (boardId, opts, syncUpdate = () => {}) => {
  const ctx = '[getBacklogIssues]';
  const { data } = await getJSON(ctx, backlogIssuesForBoard(boardId), opts);
  logger.debug(ctx, `${data.issues.length} issues returned`);
  syncUpdate(`${data.issues.length} backlog issues`);
  logger.silly(data.issues);
  return toIssues(data.issues);
};

const getIssuesForSprint = async (sprint, opts) => {
  const ctx = '[getIssuesForSprint]';
  logger.silly(ctx, sprint.name, issuesForSprint(sprint));
  const { data } = await getJSON(ctx, issuesForSprint(sprint), opts);
  const issues = toIssues(data.issues, sprint);
  logger.debug(ctx, `${issues.length} issues for sprint ${sprint.id} (${sprint.name})`);
  logger.silly(ctx, '===================================');
  logger.silly(R.map(issue => issue.toSummaryString(), issues));
  logger.silly(ctx, '===================================');
  return issues;
};

const sumPointsResolvedInSprint = R.pipe(
  R.filter(R.prop('resolvedInSprint')),
  R.pluck('points'),
  R.sum
);

const getSprintWithIssues = async (rawSprint, opts, syncUpdate = () => {}) => {
  const ctx = '[getSprintWithIssues]';
  syncUpdate(`getting updated sprint: ${rawSprint.name}... `);
  const issues = await getIssuesForSprint(rawSprint, opts);
  syncUpdate(`getting updated sprint: ${rawSprint.name}... ${issues.length} issues`);
  logger.debug(ctx, 'issues', issues.length);
  logger.silly(ctx, 'raw', rawSprint);
  const sprint = R.merge(rawSprint, {
    issues,
    startDate: moment(rawSprint.startDate),
    completeDate: rawSprint.completeDate ? moment(rawSprint.completeDate) : null,
    endDate: moment(rawSprint.endDate),
    totalPoints: sumPointsResolvedInSprint(issues),
  });
  logger.debug(ctx, sprint.name, sprint.totalPoints, sprint.issues.length);
  return sprint;
};

// const debugSprint = s => ({
//   id: s.id,
//   name: s.name,
//   sd: s.startDate,
//   ed: s.endDate,
//   cd: s.completeDate,
// });

// const debugSprints = ss => R.map(debugSprint, ss);
// =============================================

const BATCH_SIZE = 50;

const batchGet = async cb => {
  const allRecords = [];
  let currentIndex = 0;
  let lastCount;
  do {
    const records = await cb(currentIndex);
    logger.silly('......records: ', currentIndex, records.length);
    currentIndex += BATCH_SIZE;
    lastCount = records.length;
    allRecords.push(records);
  } while (lastCount === BATCH_SIZE);

  return allRecords;
};

const getBoards = async (ctx, boardId, opts, startAt) => {
  const { data } = await getJSON(ctx, sprintsForBoard(boardId, startAt), opts);
  // logger.debug(ctx, boardId, startAt, data.values.length);
  logger.silly(
    ctx,
    R.map(
      v => ({
        id: v.id,
        name: v.name,
        state: v.state,
        sd: v.startDate,
      }),
      data.values
    )
  );
  return data.values;
};

const getAllSprints = async (boardId, opts, syncUpdate = () => {}) => {
  const ctx = '[getAllSprints]';
  const allRecords = await batchGet(async currentIndex => {
    syncUpdate(`getting all sprints (${currentIndex + BATCH_SIZE}...)...`);
    return await getBoards(ctx, boardId, opts, currentIndex);
  });
  const allSprints = R.pipe(
    R.flatten(),
    R.sortBy(R.prop('id'))
  )(allRecords);
  syncUpdate(`${allSprints.length} total sprints`);
  logger.silly(ctx, 'allSprints: ', allSprints);
  logger.silly(ctx, 'allSprints: ', allSprints.length);
  return allSprints;
};

const getJiraVersions = async (ctx, boardId, opts, startAt) => {
  const { data } = await getJSON(ctx, jiraVersionsForBoard(boardId, startAt), opts);
  logger.silly(ctx, boardId, startAt, data.values.length);
  return data.values;
};

const getAllJiraVersions = async (boardId, opts, syncUpdate = () => {}) => {
  const ctx = '[getAllJiraVersions]';
  const allRecords = await batchGet(async currentIndex => {
    syncUpdate(`getting all releases (${currentIndex + BATCH_SIZE}...)...`);
    return await getJiraVersions(ctx, boardId, opts, currentIndex);
  });
  const allJiraVersions = R.pipe(
    R.flatten(),
    R.sortBy(R.prop('id'))
  )(allRecords);
  logger.silly(ctx, 'allJiraVersions: ', allJiraVersions);
  logger.debug(ctx, 'allJiraVersions: ', allJiraVersions.length);
  return allJiraVersions;
};

export default {
  getBacklog,
  getBacklogIssues,
  getIssuesForSprint,
  getSprintWithIssues,
  getAllSprints,
  getAllJiraVersions,
};
