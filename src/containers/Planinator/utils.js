import * as R from 'ramda';
import diffInDays from 'date-fns/difference_in_days';
import { getUTCDate, toTitleCase } from '../../utils';
import mo from 'moment';
import uuid from 'uuid/v4';

export { uuid };

export const dateFormat = 'YYYY-MM-DD';
export const tsToDateString = ts => mo.utc(ts).format(dateFormat);
export const dateStringToTs = dateString => mo.utc(dateString).valueOf();

const DAYS_PER_MONTH = 30;

export const getTodayAndPosition = settings => {
  const today = getUTCDate(new Date());
  const left = mapStartDateToTimeline(settings, today);
  return {
    today,
    left,
  };
};

export const phaseMap = {
  assess: { bg: '#f8941d', color: '#fff' },
  design: { bg: '#42a9de', color: '#fff' },
  build: { bg: 'rgba(110,182,31,0.75)', color: '#fff' },
  launch: { bg: '#fc3d1f', color: '#fff' },
  complete: { bg: '#999', color: '#fff' },
};
export const phaseBgMap = {
  ...phaseMap,
  default: { bg: 'rgba(82,112,147,0.75)', color: '#fff' },
};

export const phases = R.keys(phaseMap);
export const phaseOptions = R.map(p => ({ value: p, label: toTitleCase(p) }))(phases);

export const mapStartDateToTimeline = (settings, startDate, offset = 0) => {
  const numDays = diffInDays(startDate, settings.startDate);
  const pxPerDay = settings.monthWidthPx / DAYS_PER_MONTH;
  // console.log(
  //   `left: ${numDays} days x ${pxPerDay}px == ${numDays * pxPerDay}, ${offset} offset, ${numDays *
  //     pxPerDay -
  //     offset} final width`
  // );
  return numDays * pxPerDay - offset;
};

export const mapEndDateToWidth = (settings, { start, end }) => {
  const numDays = diffInDays(end, start);
  const pxPerDay = settings.monthWidthPx / DAYS_PER_MONTH;
  // console.log(`${f(start)} - ${f(end)} => ${numDays} days start to end`);
  // console.log(
  //   `width: ${numDays} days x ${pxPerDay}px == ${numDays * pxPerDay}, ${numDays *
  //     pxPerDay} final width`
  // );
  return numDays * pxPerDay;
};
