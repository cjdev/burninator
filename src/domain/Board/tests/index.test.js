import moment from 'moment';
import R from 'ramda';
import * as BoardExports from '../';

const format = m => moment(m).format('YYYY-MM-DD');
const basisDate = moment('2017-01-04'); // wednesday

describe('Board', () => {
  describe('calculateDatePointMapForVelocity', () => {
    test('should return entries rounded to week boundaries ', () => {
      const velocity = 10;
      const points = 100;
      const datePointMap = BoardExports.calculateDatePointMapForVelocity(
        basisDate,
        velocity,
        points
      );
      const dateOfFirstWeek = format(R.values(datePointMap)[0]);
      expect(dateOfFirstWeek).toEqual('2017-01-07'); // saturday
    });

    test('should prorate partial week', () => {
      const velocity = 10;
      const points = 100;
      const datePointMap = BoardExports.calculateDatePointMapForVelocity(
        basisDate,
        velocity,
        points
      );
      const pointsOfFirstWeek = R.keys(datePointMap)[0];
      expect(pointsOfFirstWeek).toEqual('5'); // saturday
    });

    test('should calculate map based on basisDate, not current time', () => {
      const velocity = 10;
      const points = 20;
      const datePointMap = BoardExports.calculateDatePointMapForVelocity(
        basisDate,
        velocity,
        points
      );
      const dates = R.values(datePointMap);
      dates.forEach(d => {
        expect(moment(d).valueOf()).toBeLessThan(moment().valueOf());
      });
    });
  });

  describe('calculateEpics', () => {
    const makeIssueList = () => {
      return [
        {
          epic: { name: 'epic1' },
          ordinal: 2,
          completedWeek: 2222,
          completedWeekPadded: 4444,
          points: 1,
        },
        {
          epic: { name: 'epic1' },
          ordinal: 3,
          completedWeek: 2223,
          completedWeekPadded: 4444,
          points: 11,
        },
        {
          epic: { name: 'epic2' },
          ordinal: 1,
          completedWeek: 1111,
          completedWeekPadded: 3333,
          points: 2,
        },
      ];
    };

    test('should extract all epics from issues', () => {
      const epics = BoardExports.calculateEpics(makeIssueList());
      expect(epics).toHaveLength(2);
    });

    test('should sort epics by completedWeek', () => {
      const epics = BoardExports.calculateEpics(makeIssueList());
      expect(epics[0].name).toEqual('epic2');
    });

    test('should sum total points for each epic', () => {
      const epics = BoardExports.calculateEpics(makeIssueList());
      expect(epics[0].totalPoints).toEqual(2);
      expect(epics[1].totalPoints).toEqual(12);
    });
  });

  describe('calculateJiraVersions', () => {
    const rawVersions = {
      v1: { name: 'v1Name' },
      v2: { name: 'v2Name' },
    };
    const makeVersionsIssueList = () => {
      return [
        {
          versionObj: { id: 'v1', name: 'v1' },
          ordinal: 2,
          completedWeek: 2222,
          completedWeekPadded: 4444,
          points: 1,
          pointsLeft: 1,
          isExcepted: false,
        },
        {
          versionObj: { id: 'v1', name: 'v1' },
          ordinal: 3,
          completedWeek: 2223,
          completedWeekPadded: 4444,
          points: 11,
          pointsLeft: 11,
          isExcepted: false,
        },
        {
          versionObj: { id: 'v2', name: 'v2' },
          ordinal: 1,
          completedWeek: 1111,
          completedWeekPadded: 3333,
          points: 2,
          pointsLeft: 2,
          isExcepted: false,
        },
      ];
    };

    test('should extract all versions from issues', () => {
      const versions = BoardExports.calculateJiraVersions2(makeVersionsIssueList(), rawVersions);
      expect(versions).toHaveLength(2);
    });

    test('should sort versions by completedWeek', () => {
      const versions = BoardExports.calculateJiraVersions2(makeVersionsIssueList(), rawVersions);
      expect(versions[0].name).toEqual('v2Name');
    });

    test('should sum total points for each version', () => {
      const versions = BoardExports.calculateJiraVersions2(makeVersionsIssueList(), rawVersions);
      expect(versions[0].totalPoints).toEqual(2);
      expect(versions[1].totalPoints).toEqual(12);
    });
  });

  describe('calculateVelocityData', () => {
    const makeIteraions = () => {
      return [
        {
          issues: [
            { resolvedInSprint: true, resolution: { name: 'Done', date: '2016-12-29' }, points: 1 },
            { resolvedInSprint: true, resolution: { name: 'Done', date: '2017-12-01' }, points: 9 },
            {
              resolvedInSprint: false,
              resolution: { name: 'Done', date: '2017-12-01' },
              points: 5,
            },
          ],
        },
      ];
    };
    const makeOpts = () => ({
      computedConfig: {
        velocity: {
          lookback: {
            computed: 2,
          },
          override: {},
        },
      },
    });

    test('should return opts passed in', () => {
      const iterations = [];
      const opts = makeOpts();
      const velocityData = BoardExports.calculateVelocityData(basisDate, iterations, opts);
      expect(velocityData.opts).toEqual(opts);
    });

    test('should lookback based on opts', () => {
      const iterations = makeIteraions();
      const opts = makeOpts();
      opts.computedConfig.velocity.lookback.computed = 2;
      const velocityData = BoardExports.calculateVelocityData(basisDate, iterations, opts);
      expect(velocityData.finalVelocity).toEqual(5);
    });

    test('should ignore computed velocity if overridden in opts', () => {
      const iterations = makeIteraions();
      const opts = makeOpts();
      opts.computedConfig.velocity.override = {
        isOverridden: true,
        computed: 100,
      };
      const velocityData = BoardExports.calculateVelocityData(basisDate, iterations, opts);
      expect(velocityData.finalVelocity).toEqual(100);
      expect(velocityData.overridden).toBe(true);
    });
  });

  describe('calculateV2ChartData', () => {
    test('TODO', () => {
      expect(1).toEqual(1);
    });
  });

  describe('calculateEnhancedIssueList', () => {
    const callCalcEnhancedIssueList = (args = {}) => {
      const {
        basisDate = null,
        boardData = {
          allIssues: [],
        },
        finalVelocity = null,
        scopeGrowth = null,
        stalledConfig = {},
        exceptedIssues = [],
      } = args;

      return BoardExports.calculateEnhancedIssueList(
        basisDate,
        boardData,
        finalVelocity,
        scopeGrowth,
        stalledConfig,
        exceptedIssues
      );
    };

    test('should return empty array when empty boardData.allIssues', () => {
      const enhancedIssues = callCalcEnhancedIssueList();
      expect(enhancedIssues).not.toBe(null);
    });

    const buildBasicIssues = () => {
      const basisDate = moment('2018-01-01').valueOf();
      const boardData = {
        allIssues: [
          {
            key: '0',
            status: { category: 'c2' },
            epic: { name: 'e2' },
            version: 'v1',
            points: 5,
            pointsLeft: 5,
          },
          {
            key: '1',
            status: { category: 'c2' },
            epic: { name: 'e2' },
            version: 'v2',
            points: 1,
            pointsLeft: 1,
          },
          {
            key: '2',
            status: { category: 'c3' },
            epic: { name: 'e3' },
            version: 'v2',
            points: 13,
            pointsLeft: 13,
          },
        ],
      };
      const finalVelocity = 3;
      const scopeGrowth = 0.3;
      return {
        basisDate,
        boardData,
        finalVelocity,
        scopeGrowth,
      };
    };

    test('should return all issues', () => {
      const enhancedIssues = callCalcEnhancedIssueList(buildBasicIssues());
      expect(enhancedIssues).not.toBe(null);
      expect(enhancedIssues).toHaveLength(3);
    });

    test('should identify final in epic', () => {
      const enhancedIssues = callCalcEnhancedIssueList(buildBasicIssues());
      const [zero, one, two] = enhancedIssues;
      expect(zero.isFinalInEpic).toBe(false);
      expect(one.isFinalInEpic).toBe(true);
      expect(two.isFinalInEpic).toBe(true);
    });

    test('should identify final in version', () => {
      const enhancedIssues = callCalcEnhancedIssueList(buildBasicIssues());
      const [zero, one, two] = enhancedIssues;
      expect(zero.isFinalInVersion).toBe(true);
      expect(one.isFinalInVersion).toBe(false);
      expect(two.isFinalInVersion).toBe(true);
    });

    test('should calculate cumulative points', () => {
      const enhancedIssues = callCalcEnhancedIssueList(buildBasicIssues());
      const [zero, one, two] = enhancedIssues;
      expect(zero.cumulativePoints).toBe(5);
      expect(one.cumulativePoints).toBe(6);
      expect(two.cumulativePoints).toBe(19);
    });

    test('should calculate points after issue', () => {
      const enhancedIssues = callCalcEnhancedIssueList(buildBasicIssues());
      const [zero, one, two] = enhancedIssues;
      expect(zero.pointsRemainingAfterMe).toBe(14);
      expect(one.pointsRemainingAfterMe).toBe(13);
      expect(two.pointsRemainingAfterMe).toBe(0);
    });

    test('should calculate dates', () => {
      const enhancedIssues = callCalcEnhancedIssueList(buildBasicIssues());
      const zero = enhancedIssues[0];
      const two = enhancedIssues[2];
      expect(moment(zero.completedWeek).format('YYYY-MM-DD')).toEqual('2018-01-13');
      expect(moment(zero.completedWeekPadded).format('YYYY-MM-DD')).toEqual('2018-01-20');
      expect(moment(two.completedWeek).format('YYYY-MM-DD')).toEqual('2018-02-17');
      expect(moment(two.completedWeekPadded).format('YYYY-MM-DD')).toEqual('2018-03-10');
    });
  });
});
