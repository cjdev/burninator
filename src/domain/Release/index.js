import * as R from 'ramda';
import { rDebug } from '../../utils';

const versionIdLens = R.view(R.lensPath(['versionObj', 'id']));

const getBacklogIssuesByVersion = R.pipe(
  R.map(i => R.assoc('vId', versionIdLens(i))(i)),
  // debug,
  R.groupBy(R.prop('vId'))
);
const getFirstInProgress = issues => {
  return R.pipe(
    R.map(i => R.filter(e => e.from === '1' && e.to === '3')(i.statusHistory.entries || [])),
    R.flatten,
    R.sort((a, b) => new Date(a.ts) - new Date(b.ts)),
    R.head,
    R.prop('ts')
  )(issues);
};
const getStartOfFirstInBacklog = (versionIssues, allIssues) => {
  // console.log('getStartOfFirstInBacklog');
  const firstWithVersion = R.pipe(
    R.map(R.pick(['key', 'completedWeekPadded', 'ordinal'])),
    R.sort((a, b) => a.ordinal - b.ordinal),
    // debug,
    R.head
  )(versionIssues);
  const previous = R.find(R.propEq('ordinal', firstWithVersion.ordinal - 1))(allIssues);
  // console.log('previous: ', previous.ordinal, previous.completedWeekPadded);
  return previous.completedWeekPadded;
};
const getLastCompletedWeekPadded = R.pipe(
  R.sort((a, b) => a.ordinal - b.ordinal),
  // debug,
  R.last,
  R.prop('completedWeekPadded')
);

const getPastSprintIssuesByVersion = R.pipe(
  R.map(R.prop('issues')),
  R.flatten,
  R.map(i => R.assoc('vId', versionIdLens(i))(i)),
  // debug
  R.groupBy(R.prop('vId'))
);

const getEndOfLastInPast = (vId, issues) => {
  // console.log('getEndOfLastInPast vId, issues.length: ', vId, issues.length);
  const result = R.pipe(
    R.map(i => R.filter(e => e.to === '6')(i.statusHistory.entries || [])),
    R.filter(i => i.length > 0),
    R.flatten,
    // R.forEach(x => console.log('beforeSort', vId, x)),
    R.sort((a, b) => new Date(a.ts) - new Date(b.ts)),
    // R.forEach(x => console.log('afterSort', vId, x.ts)),
    R.last,
    R.prop('ts')
  )(issues);
  return result;
};

const getStartEnd = (
  vId,
  backlogIssues = [],
  pastSprintIssues = [],
  enhancedIssueList,
  version
) => {
  // console.log('>> getStartEnd:', vId);
  // startDate:
  //  1. looks for earliest 'in-progress' among all the stories in past
  //  2. if none found, find the first story in backlog, get story before it in the big list,
  //     use completedWeekPadded
  let startDate = getFirstInProgress(pastSprintIssues);
  if (!startDate) {
    startDate = getStartOfFirstInBacklog(backlogIssues, enhancedIssueList);
  }
  if (!startDate) {
    console.log(`NO STARTDATE FOR ${vId} ${version.name}`);
  }
  // console.log(vId, 'startDate: ', startDate);

  // endDate:
  //  1. look for latest completedWeekPadded in backlog
  //  2. if none found, find latest resolution date in past list
  //
  let endDate = getLastCompletedWeekPadded(backlogIssues);
  // console.log(vId, 'endDate: ', endDate);
  if (!endDate) {
    endDate = getEndOfLastInPast(vId, pastSprintIssues);
    // console.log(vId, 'past endDate: ', endDate);
  }
  if (!endDate) {
    console.log(`NO END FOR ${vId} ${version.name}`);
  }
  // console.log('------------- getStartEnd: vId, start, end', vId, startDate, endDate);
  return {
    startDate,
    endDate,
  };
};

// //////////////////////////////////////////////////////////////////////////////
// 0. board.enhancedIssueList
// 0. boardData.sprints.issues
// 2. flatten the versionObj.id
// 3. group issues by that id

// 4. calculate startDate and endDate based on the issues:
//    - startDate is either:
//      - the earliest date ant story went into 'in progress'
//      - if none (all stories are in the future)
//        - the completedWeekpadded of the story before the first
//          story in the enhancedIssueList
//    - endDate is either:
//      - the last completedWeekPadded in enhancedIssueList
//      - if none (all stories are done)
//        - the latest resolved date?
//
// NOTE the same story can be in both lists

const debugVersionsById = versions => {
  return R.pipe(
    R.values,
    R.map(R.pick(['id', 'name'])),
    rDebug,
    R.keys,
    R.length
  )(versions);
};

export const getReleases = (enhancedIssueList, versionsById, boardData) => {
  // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> Release.getReleases');

  // console.log('enhancedIssueList: ', enhancedIssueList[0]);
  // console.log('versionsById: ', debugVersionsById(versionsById));
  // console.log('>> boardData: ', R.keys(boardData));

  const backlogIssueListByVersion = getBacklogIssuesByVersion(enhancedIssueList || []);
  // console.log('>> backlogIssueList.length: ', R.keys(backlogIssueListByVersion));

  const pastSprintIssuesByVersion = getPastSprintIssuesByVersion(boardData.sprints || []);
  // console.log('>> pastSprintIssueByVersion: ', R.keys(pastSprintIssuesByVersion));

  const combinedVersionIdSet = R.pipe(
    R.keys,
    R.concat(R.keys(backlogIssueListByVersion)),
    R.filter(i => i !== 'undefined'),
    R.uniq,
    R.sort((a, b) => a.localeCompare(b))
  )(pastSprintIssuesByVersion);
  // console.log('>> combinedVersionIdSet ', combinedVersionIdSet);

  const finalVersionDates = R.pipe(
    R.map(vId => {
      return {
        vId,
        ...versionsById[vId],
        ...getStartEnd(
          vId,
          backlogIssueListByVersion[vId],
          pastSprintIssuesByVersion[vId],
          enhancedIssueList,
          versionsById[vId]
        ),
      };
    }),
    R.groupBy(R.prop('vId')),
    R.map(R.prop(0))
  )(combinedVersionIdSet);
  // console.log('finalVersionDates: ', finalVersionDates);
  // console.log('finalVersionDates: ', R.keys(finalVersionDates).length);
  return finalVersionDates;
};
