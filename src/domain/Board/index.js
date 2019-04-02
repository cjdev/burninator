/* eslint-disabe max-len, class-methods-use-this */
import * as R from 'ramda';

import subtractWeeks from 'date-fns/sub_weeks';
import addWeeks from 'date-fns/add_weeks';
import endOfWeek from 'date-fns/end_of_week';
import isWithinRange from 'date-fns/is_within_range';
import isAfter from 'date-fns/is_after';
import isBefore from 'date-fns/is_after';
import isSameDay from 'date-fns/is_same_day';

import { diffDates, formatDate, formatIso, formatTs, weekDaysBetween } from '../../utils';
import getOptions from './options';

const hoursInAWeek = 7 * 24;
const defaultToEmpty = R.defaultTo({});
const setIssuePoints = issue => R.assoc(issue.key, issue.pointsRemainingAfterMe);
const addIssue = (issue, week) => setIssuePoints(issue)(defaultToEmpty(week));
const lastIssue = R.pipe(
  R.sortBy(R.prop('ordinal')),
  R.last
);
const getCompletedVersionsForWeek = (issueKeysForWeek, allIssues) => {
  return R.pipe(
    R.filter(i => issueKeysForWeek.includes(i.key)),
    R.filter(i => i.isFinalInVersion)
  )(allIssues);
};
const closedInSprint = issue => issue.resolution.name === 'Done' && issue.resolvedInSprint;
const getClosedIssues = iteration => R.filter(closedInSprint)(iteration.issues);
const getIssuesTotalPoints = R.pipe(
  R.pluck('points'),
  R.sum
);
const getIssuesTotalPointsLeft = R.pipe(
  R.pluck('pointsLeft'),
  R.sum
);

const getResolutionDate = R.view(R.lensPath(['resolution', 'date']));
const getEpicName = R.view(R.lensPath(['epic', 'name']));
const getIssueVersionName = R.prop('version');

const containsVersionObj = issue => {
  const b = R.view(R.lensPath(['versionObj', 'name']));
  return R.not(R.isNil(b(issue)));
};

// export for testing
export const calculateDatePointMapForVelocity = (basisDate, V, totalRemainingPoints) => {
  const endOfThisWeek = endOfWeek(basisDate);
  const endOfLastWeek = endOfWeek(subtractWeeks(basisDate, 1));
  const hoursFromEndOfLastWeekToNow = diffDates(basisDate, endOfLastWeek, 'hours');

  const percentOfThisWeekRemaining =
    Math.round(((hoursInAWeek - hoursFromEndOfLastWeekToNow) / hoursInAWeek) * 100) / 100;
  const pointsRemainingThisWeek = Math.floor(percentOfThisWeekRemaining * V);
  const pointsRemainingAfterThisWeek = totalRemainingPoints - pointsRemainingThisWeek;

  // add one for this week, no matter what is left of it
  const numberOfWeeksNeeded = 1 + Math.ceil(pointsRemainingAfterThisWeek / V);
  // console.log('remain, V, weeks: ', this.totalRemainingPoints, V, numberOfWeeksNeeded);
  // create a map of [points to that date] => date
  const datePointMap = R.reduce((acc, x) => {
    return {
      ...acc,
      [Math.round(V * x + pointsRemainingThisWeek)]: formatIso(addWeeks(endOfThisWeek, x)),
    };
  }, {})(R.range(0, numberOfWeeksNeeded));
  // console.log('datePointMap: ', datePointMap);
  return datePointMap;
};

// export for testing
export const calculateEpics = issues => {
  return R.pipe(
    R.groupBy(i => i.epic.name),
    R.mapObjIndexed((issues, name) => ({
      name,
      issues,
      completedWeek: lastIssue(issues).completedWeek,
      completedWeekPadded: lastIssue(issues).completedWeekPadded,
      totalPoints: getIssuesTotalPoints(issues),
    })),
    R.values,
    R.sortBy(R.prop('completedWeek'))
  )(issues);
};

// export for testing
export const calculateJiraVersions1 = issues => {
  return R.pipe(
    R.filter(R.propEq('isExcepted', false)),
    R.groupBy(R.prop('version')),
    R.mapObjIndexed((issues, name) => ({
      name,
      issues,
      completedWeek: lastIssue(issues).completedWeek,
      completedWeekPadded: lastIssue(issues).completedWeekPadded,
      ordinal: lastIssue(issues).ordinal,
      totalPoints: getIssuesTotalPoints(issues),
      totalPointsLeft: getIssuesTotalPointsLeft(issues),
    })),
    R.values,
    R.sortBy(R.prop('ordinal'))
  )(issues);
};

const getVersionName = id => R.view(R.lensPath([id, 'name']));
const getVersionDescription = id => R.view(R.lensPath([id, 'description']));

// export for testing
export const calculateJiraVersions2 = (issues, versions) => {
  return R.pipe(
    R.filter(R.propEq('isExcepted', false)),
    R.groupBy(R.view(R.lensPath(['versionObj', 'id']))),
    R.mapObjIndexed((issues, id) => ({
      id,
      name: getVersionName(id)(versions),
      issues,
      completedWeek: lastIssue(issues).completedWeek,
      completedWeekPadded: lastIssue(issues).completedWeekPadded,
      ordinal: lastIssue(issues).ordinal,
      totalPoints: getIssuesTotalPoints(issues),
      totalPointsLeft: getIssuesTotalPointsLeft(issues),
      description: getVersionDescription(id)(versions),
    })),
    R.values,
    R.sortBy(R.prop('ordinal'))
  )(issues);
};

const weekEnding = dateSeededDataKeys => ({ endDate }) => {
  let week = R.find(d => {
    const a = isWithinRange(endDate, subtractWeeks(d, 1), d);
    return a;
  })(dateSeededDataKeys);

  // this handles an edge case where a story may close on
  // the same day as the earliest date
  if (!week) {
    const earliestDate = R.last(dateSeededDataKeys);
    // the documentation for isBefore seems to contradict the result
    // of actually calling the function???
    if (isBefore(earliestDate, endDate)) {
      week = earliestDate;
    }
  }
  return week;
};

const withinDateRange = earliestDate => ({ endDate }) => {
  const oneWeekBeforeEarliest = subtractWeeks(earliestDate, 1);
  // console.log(
  //   'within: ',
  //   endDate,
  //   oneWeekBeforeEarliest,
  //   isAfter(endDate, oneWeekBeforeEarliest),
  //   isSameDay(endDate, oneWeekBeforeEarliest)
  // );
  return isAfter(endDate, oneWeekBeforeEarliest) || isSameDay(endDate, oneWeekBeforeEarliest);
};

// export for testing
export function calculateVelocityData(basisDate, iterations = [], opts) {
  const lookback = opts.computedConfig.velocity.lookback.computed;
  const dateSeededData = R.reduce(
    (acc, i) => ({
      ...acc,
      [formatIso(subtractWeeks(basisDate, i))]: [],
    }),
    {}
  )(R.range(0, lookback));
  // console.log('dateSeededData: ', dateSeededData);
  const dateSeededDataKeys = R.keys(dateSeededData);
  // console.log('dateSeededDataKeys: ', dateSeededDataKeys, R.last(dateSeededDataKeys));

  const completedIssuesByWeek = R.pipe(
    // R.forEach(console.log),
    R.chain(getClosedIssues),
    R.map(i => ({
      ...i,
      endDate: i.resolution.date,
    })),
    R.filter(withinDateRange(R.last(dateSeededDataKeys))),
    // R.forEach(console.log),
    R.groupBy(weekEnding(dateSeededDataKeys))
  )(iterations);
  // console.log('completedIssuesByWeek: ', completedIssuesByWeek);

  const weeksInRange = {
    ...dateSeededData,
    ...completedIssuesByWeek,
  };
  // console.log('weeksInRange: ', weeksInRange);

  const graphData = R.map(group => ({
    points: getIssuesTotalPoints(group),
    issues: group,
  }))(weeksInRange);
  // console.log('board.graphData: ', graphData);

  const totalPoints = R.pipe(
    R.values,
    R.flatten,
    getIssuesTotalPoints
  )(weeksInRange);
  // console.log('totalPoints: ', totalPoints);

  const naturalVelocity = Math.round(totalPoints / lookback);
  // console.log('naturalVelocity: ', naturalVelocity);

  const finalVelocity = opts.computedConfig.velocity.override.computed || naturalVelocity;

  return {
    opts,
    overridden: opts.computedConfig.velocity.override.isOverridden,
    lookbackWeeks: opts.computedConfig.velocity.lookback.computed,
    naturalVelocity,
    finalVelocity,
    graphData,
  };
}

const zeroPointCategories = ['Closed', 'Needs SOX', 'Needs Demo'];
const getPointsLeft = issue => (zeroPointCategories.includes(issue.status.name) ? 0 : issue.points);
const getPointsLeftFromOrdinal = i =>
  R.pipe(
    R.take(i.ordinal + 1),
    R.filter(i => !i.isExcepted),
    R.pluck('pointsLeft'),
    R.sum
  );

const isFinalFiltered = (filter, numberedIssues) => issue =>
  R.pipe(
    R.filter(i => filter(i, issue)),
    R.last,
    R.propEq('key', issue.key)
  )(numberedIssues);

const dateFromPointTotal = (points, datePointMap) => {
  const dateIndex = R.find(p => parseInt(p, 10) >= points)(R.keys(datePointMap));
  return datePointMap[dateIndex];
};

const filterByEpicName = (i, issue) => R.equals(getEpicName(i), getEpicName(issue));
const filterByVersionName = (i, issue) =>
  R.equals(getIssueVersionName(i), getIssueVersionName(issue));

const calculateIsStalled = (issue, stalledConfig) => {
  const stalledConfigForPoints = stalledConfig[issue.points];

  // console.log(
  //   `[stalled 0] [${issue.key} ${issue.points}] status ${
  //     issue.status.name
  //   } [ever in-prog]? ${!!R.path(['statusHistory', 'latestInProgress'])(
  //     issue
  //   )} / config? ${stalledConfigForPoints}`
  // );

  if (
    issue.status.name === 'Closed' ||
    !R.path(['statusHistory', 'latestInProgress'])(issue) ||
    !stalledConfigForPoints
  )
    return {
      isStalled: false,
    };

  const { ts } = issue.statusHistory.latestInProgress;
  const daysInProgress = weekDaysBetween(ts, new Date());
  // console.log('ts, new Date(): ', ts, new Date(), daysInProgress);

  // console.log(
  //   `    [stalled 1] days <= config?  | ${daysInProgress} <= ${stalledConfigForPoints} ? ${daysInProgress <=
  //     stalledConfigForPoints}`
  // );

  if (daysInProgress <= stalledConfigForPoints) {
    return {
      isStalled: false,
    };
  }

  // console.log('        [stalled 2] | true');

  return {
    isStalled: true,
    stalledMessage: `${issue.points} point story in progress for ${daysInProgress} days`,
  };
};

export const calculateEnhancedIssueList = (
  basisDate,
  boardData,
  velocity,
  scopeGrowth,
  stalledConfig,
  exceptedIssues
) => {
  const issues = boardData.allIssues || [];
  const workingIssues = R.map(x => ({
    ordinal: x,
    pointsLeft: getPointsLeft(issues[x]),
    isExcepted: R.contains(issues[x].key, exceptedIssues),
    ...issues[x],
  }))(R.range(0, issues.length));

  const totalRemainingPoints = getIssuesTotalPoints(workingIssues || []);

  const insideDateMap = calculateDatePointMapForVelocity(basisDate, velocity, totalRemainingPoints);
  const outsideDateMap = calculateDatePointMapForVelocity(
    basisDate,
    velocity * (1 - scopeGrowth),
    totalRemainingPoints
  );

  const isFinalInEpic = isFinalFiltered(filterByEpicName, workingIssues);
  const isFinalInVersion = isFinalFiltered(filterByVersionName, workingIssues);

  const enhancedIssueList = R.map(i => {
    // console.log('i: ', i);
    const pointsLeftWithMe = getPointsLeftFromOrdinal(i)(workingIssues);
    const resolutionDate = getResolutionDate(i);
    return {
      ...i,
      stalledStatus: calculateIsStalled(i, stalledConfig),
      completedWeek: resolutionDate || dateFromPointTotal(pointsLeftWithMe, insideDateMap),
      completedWeekPadded: resolutionDate
        ? ''
        : dateFromPointTotal(pointsLeftWithMe, outsideDateMap),
      cumulativePoints: pointsLeftWithMe,
      epicName: getEpicName(i),
      isFinalInEpic: isFinalInEpic(i),
      isFinalInVersion: isFinalInVersion(i),
      pointsRemainingAfterMe: totalRemainingPoints - pointsLeftWithMe,
    };
  })(workingIssues);
  return enhancedIssueList;
};

// eslint-disable-next-line no-unused-vars
const debugTableEnhancedIssueList = issues => {
  if (!console.table) return;
  const a = R.map(i => ({
    ordinal: i.ordinal,
    key: i.key,
    status: i.status.name,
    points: i.points,
    pointsLeft: i.pointsLeft,
    excepted: i.isExcepted,
    inside: formatDate(i.completedWeek),
    outside: formatDate(i.completedWeekPadded),
  }))(issues);
  console.table(a);
};

export const calculateV2ChartData = enhancedIssueList => {
  const workingIssues = R.filter(i => i.status.category !== 'Done')(enhancedIssueList);

  const issuesByWeek = R.reduce(
    (acc, issue) => ({
      ...acc,
      [issue.completedWeek]: addIssue(issue, acc[issue.completedWeek]),
      [issue.completedWeekPadded]: addIssue(issue, acc[issue.completedWeekPadded]),
    }),
    {},
    workingIssues
  );

  const lastWeek = R.last(R.keys(issuesByWeek));
  issuesByWeek[formatIso(addWeeks(lastWeek, 1))] = {};

  const chartData = R.pipe(
    R.map(completedWeek => {
      return {
        completedWeek,
        x: formatDate(completedWeek),
        versions: getCompletedVersionsForWeek(R.keys(issuesByWeek[completedWeek]), workingIssues),
        ...issuesByWeek[completedWeek],
      };
    }),
    R.sortBy(R.prop('completedWeek'))
  )(R.keys(issuesByWeek));

  const versionRefLines = R.pipe(
    R.filter(i => i.isFinalInVersion),
    R.pluck('completedWeek'),
    R.uniq
  )(workingIssues);

  const outsideVersionRefLines = R.pipe(
    R.filter(i => i.isFinalInVersion),
    R.pluck('completedWeekPadded'),
    R.uniq
  )(workingIssues);

  return {
    chartData,
    versionRefLines,
    outsideVersionRefLines,
  };
};

const getBoardIx = boardData => {
  if (!boardData) return undefined;
  return `${boardData.backlogName}_${formatTs(boardData.lastUpdate)}`;
};

export default class Board {
  log() {
    const args = Array.prototype.slice.call(arguments);
    args.unshift(`[${this.boardIx}]`);
    // console.log.apply(console, args);
    console.log.apply(
      console,
      R.prepend(`[${this.boardIx}]`, Array.prototype.slice.call(arguments))
    );
  }

  constructor(boardId, boardData, urlOptions, exceptedIssues) {
    // const startTs = Date.now();
    this.boardId = boardId;
    this.boardIx = getBoardIx(boardData);
    this.opts = getOptions(boardData.configurationSettings, urlOptions, exceptedIssues);
    this.serverBoardData = boardData;
    this.boardData = boardData;
    this.backlogName = boardData.backlogName;
    this.lastUpdate = boardData.lastUpdate;
    this.basisDate = boardData.lastUpdate;
    this.configuration = boardData.configurationSettings;

    this.jiraVersions = [];
    this.enhancedIssueList = [];
    this.velocityData = calculateVelocityData(this.basisDate, this.boardData.sprints, this.opts);
    // this.log('this.velocityData: ', this.velocityData);

    if (this.velocityData.finalVelocity === 0) {
      this.error = { message: 'Velocity is 0. Cannot draw board' };
    } else {
      this.enhancedIssueList = calculateEnhancedIssueList(
        this.basisDate,
        this.boardData,
        this.velocityData.finalVelocity,
        this.opts.computedConfig.scopeGrowth.computed,
        this.opts.computedConfig.stalled,
        this.opts.exceptedIssues
      );
      // debugTableEnhancedIssueList(this.enhancedIssueList);

      this.versionsById = R.pipe(
        R.groupBy(R.prop('id')),
        R.map(R.prop(0))
      )(this.serverBoardData.allJiraVersions || []);

      this.hasVersionObjects = R.any(containsVersionObj)(this.enhancedIssueList);
      this.jiraVersions = this.hasVersionObjects
        ? calculateJiraVersions2(this.enhancedIssueList, this.versionsById)
        : calculateJiraVersions1(this.enhancedIssueList);
      this.v2ChartData = calculateV2ChartData(this.enhancedIssueList);
      // console.log(`Board.ctor: ${Date.now() - startTs}ms`);
    }
  }
}
