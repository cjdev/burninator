import * as R from 'ramda';
import compareDesc from 'date-fns/compare_desc';
import moment from 'moment';
import { logger } from '../logger';
import { storyPointsField } from './jira';

const parsePoints = issue => R.view(R.lensPath(['fields', storyPointsField]), issue);

const parseVersionName = issue => R.view(R.lensPath(['fields', 'fixVersions', 0, 'name']), issue);
const parseVersion = issue => R.view(R.lensPath(['fields', 'fixVersions', 0]), issue);

const parseIssueType = issue => R.view(R.lensPath(['fields', 'issuetype', 'name']), issue);

// entries may contain 1 or more status change, 1 or more of which may be
// to "in progress". find the first one based on the timestamp
const getLatestInProgress = entries =>
  R.pipe(
    // R.forEach(e => console.log(`getLatest_before`, e)),
    R.filter(e => e.toString === 'In Progress'),
    R.sort((a, b) => compareDesc(a.ts, b.ts)),
    // R.forEach(e => console.log(`getLatest_after_sorted`, e)),
    R.head
  )(entries);

// an object with all the status changes and timestamps
const parseStatusHistory = ({ changelog, key }) => {
  const statusHistory = {
    entries: [],
    latestInProgress: null,
  };
  if (R.isNil(changelog)) return statusHistory;

  const { histories } = changelog;
  if (R.isNil(histories) || R.isEmpty(histories)) return statusHistory;

  // look through each history object
  // find items of type 'status'
  // grab the status details and the timestamp
  R.reduce(
    (acc, historyEntry) => {
      // console.log(`${key} value: `, historyEntry);
      const { items, created } = historyEntry;

      // find all the entries in the 'item' array with a type of 'status'.
      // there is *probably* only 1 status change per historyEntry, but
      // handling the possiblility that there are more...
      const statusChanges = R.filter(i => i.field === 'status')(items);
      // console.log(`${key} statusChanges: `, statusChanges);
      R.forEach(c => {
        acc.entries.push({
          ...c,
          ts: created,
        });
      })(statusChanges);
      return acc;
    },
    statusHistory,
    histories
  );
  statusHistory.latestInProgress = getLatestInProgress(statusHistory.entries);
  // logger.warn(`shshshshshs [${key}] ${JSON.stringify(statusHistory)}`);
  return statusHistory;
};

const parseEpic = issue => {
  const epic = R.view(R.lensPath(['fields', 'epic']), issue);
  if (!epic) {
    return { name: '', id: -1 };
  }
  return {
    name: epic.name,
    id: epic.id,
  };
};

const parseStatus = issue => ({
  name: R.view(R.lensPath(['fields', 'status', 'name']), issue),
  category: R.view(R.lensPath(['fields', 'status', 'statusCategory', 'name']), issue),
});

const parseResolution = issue => {
  const resolution = R.view(R.lensPath(['fields', 'resolution']), issue);
  if (R.isNil(resolution)) {
    return { name: null, date: null };
  }
  return {
    name: issue.fields.resolution.name,
    date: moment(issue.fields.resolutiondate),
  };
};

const parseCurrentSprint = issue => R.view(R.lensPath(['fields', 'sprint']), issue);

const getClosedSprints = issue => R.view(R.lensPath(['fields', 'closedSprints']), issue);
// return

/*
 * How to tell if an issue is resolved in the given sprint:
 *
 * 0. Sometimes, this is called without a 'rawSprint' parameter => return false
 * 1. If the issue has a resolution:
 *    * compare the date of that resolution to the start and end dates of the sprint
 *
 * ELSE
 *
 * Some teams have/had stories that get to 'resolved' and never to 'closed'...
 * 2. If the issue does not have a resolution:
 *    * if it is in a 'resolved' state and
 *    * it is not in a current sprint
 *    => consider the latest closed sprint that contained the issue to be
 *       the sprint that finished it
 *    => if that sprint matches rawSprint, return true
 *
 */

const resolvedInSprint = (issue, rawSprint) => {
  if (!rawSprint) return false;

  const r = parseResolution(issue);
  if (r.date !== null) {
    return (
      r.date.isAfter(moment(rawSprint.startDate)) && r.date.isBefore(moment(rawSprint.completeDate))
    );
  }

  const resolved = parseStatus(issue).name === 'Resolved';
  logger.silly(`. [${rawSprint.id}]`, issue.key, resolved);

  if (!resolved) {
    return false;
  }
  if (parseCurrentSprint(issue)) {
    return false;
  }

  const closedSprints = getClosedSprints(issue);
  if (!closedSprints || closedSprints.length === 0) return false;

  // const c = R.map(c => ({ id: c.id, date: c.completeDate }), closedSprints);
  // logger.debug(`  ${JSON.stringify(c)}`);

  const latestClosedSprint = R.pipe(
    R.sortBy(R.prop('completeDate')),
    R.reverse,
    R.head
  )(closedSprints);

  logger.silly(
    latestClosedSprint.id,
    latestClosedSprint.completeDate,
    `${latestClosedSprint.id} vs. ${rawSprint.id}?`,
    latestClosedSprint.id === rawSprint.id
  );

  return latestClosedSprint.id === rawSprint.id;
};

// HACK: Jira only adds a resolution if a story gets to status closed
// in a sprint. we have historical sprints in which stories were set
// to resolved, but not closed.
//
// This hack adds counts those stories as resolvedInSprint.
const HACKCountResolvedStatusAsResolvedInSprint = (realResolvedInSprint, issueStatus) => {
  if (realResolvedInSprint) return realResolvedInSprint;
  return issueStatus.name === 'Resolved';
};

const toIssue = (issue, sprint) => ({
  // raw: issue, // bloaty, good for debugging
  key: issue.key,
  points: parsePoints(issue),
  currentSprint: parseCurrentSprint(issue),
  closedSprints: getClosedSprints(issue),
  resolution: parseResolution(issue),
  resolvedInSprint: resolvedInSprint(issue, sprint),
  // eslint-disable-next-line new-cap
  HACKYresolvedInSprint: HACKCountResolvedStatusAsResolvedInSprint(
    resolvedInSprint(issue, sprint),
    parseStatus(issue),
    issue
  ),
  self: issue.self,
  changelog: issue.changelog,
  statusHistory: parseStatusHistory(issue),
  status: parseStatus(issue),
  summary: issue.fields.summary,
  version: parseVersionName(issue),
  versionObj: parseVersion(issue),
  epic: parseEpic(issue),
  issueType: parseIssueType(issue),
  toSummaryString() {
    const rn = this.resolution.name ? ` ${this.resolution.name}` : '';
    const resolved = this.resolvedInSprint ? ' r' : '';
    const status = this.status ? `${this.status.name}:${this.status.category}` : 'no status?';
    const resDate = this.resolution.date ? `:${this.resolution.date.format('MM/DD/YYYY')}` : '';
    return `${this.key} [${this.points}${rn}${resolved}]: ${
      this.summary
    } [${status}${resDate}] [E:${this.epic.name}] [V:${this.version}]`;
  },
});

export const toIssues = (rawIssues, sprint) => {
  if (R.isNil(rawIssues)) return [];
  try {
    return rawIssues.map(rawIssue => {
      // logger.warn(`RAW CHANGELOG: ${JSON.stringify(rawIssue.changelog, null, 4)}`);
      const i = toIssue(rawIssue, sprint);
      // logger.warn(`STATUSHISTORY[${i.key}]: ${JSON.stringify(i.statusHistory, null, 2)}`);
      return i;
    });
  } catch (err) {
    logger.error('ERRRRRRRRRRR', err);
  }
  return [];
};

export default {
  toIssues,
};
