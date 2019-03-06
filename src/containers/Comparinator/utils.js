import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled, { css } from 'styled-components/macro';
import { diffDates, format, formatDate, formatLongDate, getRelativeTime } from '../../utils';
import * as T from './Table';

export const diffBgColor = '#f9f9f9';

export const getCompletedWeek = i => R.view(R.lensPath([`${i}`, 0, 'completedWeek']));

export const getDateRange = (i, v) => {
  const est = R.view(R.lensPath([`${i}`, 0, 'completedWeek']))(v);
  const outside = R.view(R.lensPath([`${i}`, 0, 'completedWeekPadded']))(v);
  return est ? `${formatDate(est)} - ${formatDate(outside)}` : '';
};

export const getDateRangeObj = (index, v) => {
  const est = R.view(R.lensPath([`${index}`, 0, 'completedWeek']))(v);
  const outside = R.view(R.lensPath([`${index}`, 0, 'completedWeekPadded']))(v);
  // return est ? `${formatDate(est)} - ${formatDate(outside)}` : '';
  return est
    ? {
        inside: est,
        outside,
      }
    : {};
};

const getEst = i => R.view(R.lensPath([`${i}`, 0, 'completedWeek']));
const getOutside = i => R.view(R.lensPath([`${i}`, 0, 'completedWeekPadded']));

const calcEstChange = v => diffDates(getEst(1)(v), getEst(2)(v), 'weeks');
const calcOutsideChange = v => diffDates(getOutside(1)(v), getOutside(2)(v), 'weeks');

const getCellPropsColor = v => {
  if (v === 0) return '';
  return v < 0 ? 'good' : 'add';
};

const getPointsCellProps = (weeksColor, points) => {
  if (weeksColor === 'add') return { color: 'add', intensity: 5 };
  if (points < 0) return { color: 'good', intensity: 5 };
  if (points > 0) return { color: 'add', intensity: 5 };
  return {};
};

const doneDiff = {
  value: 'Done / Removed',
  cellProps: {
    fgColor: 'done',
    bgColor: 'good',
    intensity: 5,
  },
};

const addedDiff = {
  value: 'Added',
  cellProps: {
    fgColor: 'add',
    bgColor: 'add',
    intensity: 5,
  },
};

const getWeeksDiff = v => {
  const v1 = R.view(R.lensPath(['1', 0]))(v);
  const v2 = R.view(R.lensPath(['2', 0]))(v);
  if (!v1) {
    return {
      ...doneDiff,
      estimated: doneDiff,
      outside: doneDiff,
    };
  } else if (!v2) {
    return {
      ...addedDiff,
      estimated: addedDiff,
      outside: addedDiff,
    };
  } else {
    const diffEst = calcEstChange(v);
    const diffOut = calcOutsideChange(v);
    return {
      cellProps: {
        bgColor: getCellPropsColor(diffEst, diffOut),
        intensity: 5, //Math.max(Math.abs(diffEst), Math.abs(diffOut))/2,
      },
      value: `${Math.abs(diffEst)} - ${Math.abs(diffOut)}`,

      estimated: {
        cellProps: {
          fgColor: diffEst === 0 ? 'none' : undefined,
          bgColor: getCellPropsColor(diffEst),
          intensity: 5, //Math.abs(diffEst)/2,
        },
        rawValue: diffEst,
        value: Math.abs(diffEst),
      },
      outside: {
        cellProps: {
          fgColor: diffOut === 0 ? 'none' : undefined,
          bgColor: getCellPropsColor(diffOut),
          intensity: 5, //Math.abs(diffOut)/2,
        },
        rawValue: diffOut,
        value: Math.abs(diffOut),
      },
    };
  }
};

const getPointsDiff = (v, getPoints, weeks) => {
  const value = R.defaultTo(0, getPoints(1, v)) - R.defaultTo(0, getPoints(2, v));
  return {
    value,
    cellProps: getPointsCellProps(weeks.cellProps.color, value),
  };
};

export const getDiff = (v, getPoints) => {
  const weeks = getWeeksDiff(v);
  return {
    weeks,
    points: getPointsDiff(v, getPoints, weeks),
  };
};

export const formatVersionTitle2 = vx => {
  return {
    relative: getRelativeTime(vx.boardData.lastUpdate),
    timestamp: formatLongDate(vx.boardData.lastUpdate),
  };
};

export const formatVersionTitle = vx =>
  `${getRelativeTime(vx.boardData.lastUpdate)} (${format(
    vx.boardData.lastUpdate,
    'MM/DD/YYYY H:mm'
  )})`.toUpperCase();

// const toWeeksAlpha = g => 0.4; //R.clamp(0.2, 0.6)(Math.abs(g) / 10);

const addColor = `0,0,0,1`;
// const addColor = `33,150,243,.7`;
const doneColor = `0,0,0,1`;
// const doneColor = `68,120,160,1`;
const noneColor = `88,88,88,0.4`;
const fadedColor = css`
  color: #777;
`;

const addBgColor = intensity => `rgba(216,74,71,${intensity});`;
const goodBgColor = intensity => `rgba(33,150,243,${intensity});`;
const badBgColor = intensity => `rgba(255,0,0,${intensity});`;
// return `background-color: rgba(255,0,0,${toWeeksAlpha(intensity)});`;

export const CompareTd = styled(T.Td)`
  ${({ fgColor, faded }) => {
    switch (fgColor) {
      case 'add':
        return faded ? fadedColor : `color: rgba(${addColor});`;
      case 'done':
        return faded ? fadedColor : `color: rgba(${doneColor});`;
      case 'none':
        return `color: rgba(${noneColor});`;
      default:
        return faded ? fadedColor : `font-weight: 600; color: #000;`;
    }
  }};

  border: 0;
  border-left: 4px solid transparent;
  border-bottom: 0px solid transparent;
  ${({ bgColor, intensity }) => {
    switch (bgColor) {
      case 'add':
        return `background-color: ${addBgColor(0.5)}; border-color: ${addBgColor(0.9)};`;
      case 'good':
        return `background-color: ${goodBgColor(0.5)}; border-color: ${goodBgColor(0.9)};`;
      case 'bad':
        return `background-color: ${badBgColor(0.1)}; border-color: ${badBgColor(0.3)};`;
      default:
        return `background-color: ${diffBgColor};`;
    }
  }};
`;

const valueToPhrase = ({ rawValue, value }) => {
  if (R.isNil(rawValue)) return value;
  if (rawValue === 0) return 'No Change';
  const plural = Math.abs(rawValue) === 1 ? '' : 's';
  const direction = rawValue > 0 ? 'later' : 'sooner';
  return `${value} week${plural} ${direction}`;
};

export const CompareWeeksTd = ({ diff, faded }) => {
  // console.log('faded weeks: ', faded);
  return (
    <CompareTd right nowrap {...diff.cellProps} faded={faded}>
      {valueToPhrase(diff)}
    </CompareTd>
  );
};
CompareWeeksTd.defaultProps = {
  faded: false,
};
CompareWeeksTd.propTypes = {
  diff: PropTypes.object,
  faded: PropTypes.bool,
};

// const toPointsAlpha = g => {
//   const a = R.clamp(0.2, 0.5)(Math.abs(g * 2 + 20) / 100);
//   console.log('g, a: ', g, a);
//   return 0.4; //a;
// };

export const CPTD = styled(T.Td)`
  border: 1px solid green;

  border: 0;
  border-left: 4px solid transparent;
  border-bottom: 0px solid transparent;
  ${({ color, intensity }) => {
    switch (color) {
      case 'add':
        return `background-color: ${addBgColor(0.5)}; border-color: ${addBgColor(0.9)};`;
      case 'good':
        return `background-color: ${goodBgColor(0.5)}; border-color: ${goodBgColor(0.9)};`;
      case 'bad':
        return `background-color: ${badBgColor(0.1)}; border-color: ${badBgColor(0.3)};`;
      default:
        return `background-color: ${diffBgColor};`;
    }
  }};
`;

export const ComparePointsTd = ({ diff }) => (
  <CPTD right nowrap {...diff.points.cellProps}>
    {diff.points.value === 0
      ? '-'
      : diff.points.value > 0
      ? `+${diff.points.value}`
      : diff.points.value}
  </CPTD>
);
ComparePointsTd.propTypes = {
  diff: PropTypes.object,
};
