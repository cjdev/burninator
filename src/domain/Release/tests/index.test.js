import * as R from 'ramda';
import { getReleases } from '../';

// version 1000 has all stories done, none todo
// version 9000, 9001 have stories both done and to do
// version 10000 has no stories done and all todo

const enhancedIssueList = [
  {
    ordinal: 0,
    key: 'i20990101',
    versionObj: { id: 9000 },
    completedWeekPadded: new Date('2099-01-01').getTime(),
  },
  {
    ordinal: 1,
    key: 'i20990102',
    versionObj: { id: 9000 },
    completedWeekPadded: new Date('2099-01-02').getTime(),
  },
  {
    ordinal: 2,
    key: 'i20990201',
    versionObj: { id: 9001 },
    completedWeekPadded: new Date('2099-02-01').getTime(),
  },
  {
    ordinal: 3,
    key: 'i20990202',
    versionObj: { id: 9001 },
    completedWeekPadded: new Date('2099-02-02').getTime(),
  },
  {
    ordinal: 4,
    key: 'i20990203',
    versionObj: { id: 9001 },
    completedWeekPadded: new Date('2099-02-03').getTime(),
  },
  {
    ordinal: 5,
    key: 'i20990301',
    versionObj: { id: 10000 },
    completedWeekPadded: new Date('2099-03-03').getTime(),
  },
];

const versionsById = {
  1000: { id: 1000, name: 'v1000' },
  9000: { id: 9000, name: 'v9000' },
  9001: { id: 9001, name: 'v9001' },
  10000: { id: 10000, name: 'v10000-all-stories-in-future' },
};

// history =========================
const i1 = {
  key: 'i1',
  versionObj: { id: 1000 },
  statusHistory: {
    entries: [
      { from: '1', to: '3', ts: new Date('2096-01-10').getTime() },
      { to: '6', ts: new Date('2096-01-20').getTime() },
    ],
  },
};
const i1001 = {
  key: 'i1001',
  versionObj: { id: 9000 },
  statusHistory: { entries: [{ from: '1', to: '3', ts: new Date('2098-01-10').getTime() }] },
};
const i1002 = {
  key: 'i1002',
  versionObj: { id: 9000 },
  statusHistory: { entries: [{ from: '1', to: '3', ts: new Date('2098-01-10').getTime() }] },
};
const i1003 = {
  key: 'i1003',
  versionObj: { id: 9000 },
  statusHistory: { entries: [{ from: '1', to: '3', ts: new Date('2098-01-10').getTime() }] },
};

const i2001 = {
  key: 'i2001',
  versionObj: { id: 9001 },
  statusHistory: { entries: [{ from: '1', to: '3', ts: new Date('2098-01-10').getTime() }] },
};
const i2002 = {
  key: 'i2002',
  versionObj: { id: 9001 },
  statusHistory: { entries: [{ from: '1', to: '3', ts: new Date('2098-01-10').getTime() }] },
};
const i2003 = {
  key: 'i2003',
  versionObj: { id: 9001 },
  statusHistory: { entries: [{ from: '1', to: '3', ts: new Date('2098-01-10').getTime() }] },
};

const sprint1 = { id: 1, name: 'sprint1', issues: [i1, i1001, i1002, i1003] };
const sprint2 = { id: 2, name: 'sprint2', issues: [i2001, i2002, i2003] };

const boardData = { sprints: [sprint1, sprint2] };

describe('Release', () => {
  describe('getReleases', () => {
    test('should calculate basic sprint start end dates', () => {
      const result = getReleases(enhancedIssueList, versionsById, boardData);

      expect(result[1000].startDate).toEqual(new Date('2096-01-10').getTime());
      expect(result[1000].endDate).toEqual(new Date('2096-01-20').getTime());

      expect(result[9000].startDate).toEqual(new Date('2098-01-10').getTime());
      expect(result[9000].endDate).toEqual(new Date('2099-01-02').getTime());

      expect(result[9001].startDate).toEqual(new Date('2098-01-10').getTime());
      expect(result[9001].endDate).toEqual(new Date('2099-02-03').getTime());

      expect(result[10000].startDate).toEqual(new Date('2099-02-03').getTime());
      expect(result[10000].endDate).toEqual(new Date('2099-03-03').getTime());
    });
  });
});
