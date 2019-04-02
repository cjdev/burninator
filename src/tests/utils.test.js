import subtractSeconds from 'date-fns/sub_seconds';
import subtractDays from 'date-fns/sub_days';
import addHours from 'date-fns/add_hours';

import {
  diffDates,
  format,
  formatDate,
  formatIso,
  formatLongDate,
  formatOrEmpty,
  formatTs,
  getHoursDiffFromNow,
  getRelativeTime,
  sortByCompletedDate,
  weekDaysBetween,
} from '../utils';

// const testDate = new Date('2018-01-02 12:34:56');
const testDate = new Date(Date.UTC(2018, 0, 2, 20, 34, 56));

describe('utils', () => {
  describe('weekDaysSince', () => {
    test('should return 1 when given weekday range', () => {
      const result = weekDaysBetween('2018-11-02', '2018-11-03');
      expect(result).toEqual(1);
    });
    test('should return 0 when given weekend range', () => {
      const result = weekDaysBetween('2018-11-03', '2018-11-04');
      expect(result).toEqual(0);
    });
  });
  describe('formatIso', () => {
    test.skip('should format valid date', () => {
      expect(formatIso(testDate)).toEqual('2018-01-02T12:34:56-08:00');
    });
    test('should format invalid date as empty string', () => {
      expect(formatIso(null)).toEqual('');
    });
  });
  describe('format', () => {
    test.skip('should format according to parameter', () => {
      expect(format(testDate, 'YYYY')).toEqual('2018');
      expect(format(testDate, 'YYYY HH')).toEqual('2018 12');
    });
    test.skip('should format ISO when format param not specified', () => {
      expect(format(testDate)).toEqual('2018-01-02T12:34:56-08:00');
    });
    test('should format invalid date as empty string', () => {
      expect(format(null)).toEqual('');
    });
  });
  describe('formatOrEmpty', () => {
    test('should format valid date as MM/DD/YYYY', () => {
      expect(formatOrEmpty(testDate)).toEqual('01/02/2018');
    });
    test('should format invalid date as empty string', () => {
      expect(formatOrEmpty(null)).toEqual('');
    });
  });
  describe('formatDate', () => {
    test('should format valid date as M/D/YY', () => {
      expect(formatDate(testDate)).toEqual('1/2/18');
    });
    test('should format invalid date as --', () => {
      expect(formatDate(null)).toEqual('--');
    });
  });
  describe('formatLongDate', () => {
    test.skip('should format valid date as MM/DD/YYYY HH:mm:ss', () => {
      expect(formatLongDate(testDate)).toEqual('01/02/2018 12:34:56');
    });
    test('should format invalid date as --', () => {
      expect(formatLongDate(null)).toEqual('--');
    });
  });
  describe('formatTs', () => {
    test.skip('should format valid date as M/D/YY', () => {
      expect(formatTs(testDate)).toEqual('20180102_12:34:56');
    });
    test('should format invalid date as --', () => {
      expect(formatTs(null)).toEqual('Invalid date');
    });
  });
  describe('diffDates', () => {
    test('should return diff is millis when no unit param', () => {
      const oneSecondEarlierDate = subtractSeconds(testDate, 1);
      expect(diffDates(testDate, oneSecondEarlierDate)).toEqual(1000);
    });
    test('should return diff in unit when unit param specified', () => {
      const oneDayEarlierDate = subtractDays(testDate, 1);
      expect(diffDates(testDate, oneDayEarlierDate, 'day')).toEqual(1);
    });
  });
  describe('sortByCompletedDate', () => {
    test('should sort', () => {
      const oneDayEarlierDate = subtractDays(testDate, 1);
      expect(
        sortByCompletedDate({ completeDate: testDate }, { completeDate: oneDayEarlierDate })
      ).toEqual(-86400000);
      expect(
        sortByCompletedDate({ completeDate: oneDayEarlierDate }, { completeDate: testDate })
      ).toEqual(86400000);
    });
  });
  describe('getRelativeTime', () => {
    test('should return relative time', () => {
      const oneDayAgo = subtractDays(new Date(), 1);
      expect(getRelativeTime(oneDayAgo)).toEqual('a day');
    });
  });
  describe('getHoursDiffFromNow', () => {
    test('should return negative hours given time in the past', () => {
      const oneDayAgo = subtractDays(new Date(), 1);
      expect(getHoursDiffFromNow(oneDayAgo)).toBeLessThanOrEqual(-24);
    });
    test('should return positive hours given time in the future', () => {
      const someHoursAhead = addHours(new Date(), 6);
      expect(getHoursDiffFromNow(someHoursAhead)).toBeGreaterThanOrEqual(5);
    });
  });

  describe('thing', () => {
    test('should', () => {});
  });
});
