import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import isAfter from 'date-fns/is_after';
import { mapIndex, formatDate, getUTCDate } from '../../../utils';
import { mapStartDateToTimeline, mapEndDateToWidth, phaseBgMap } from '../utils';

const adjustWidth = (w, left, parentOffset) => {
  let changedLeft = false;
  if (left === 0) {
    left = 4;
    changedLeft = true;
  }
  let width = w;
  width = left + width >= parentOffset.width ? width - 6 : width;
  width = changedLeft ? width - 4 : width;
  return width;
};

const Child = ({ data, settings, parentOffset = { left: 0, width: 0 } }) => {
  const start = getUTCDate(data.startDate);
  const end = getUTCDate(data.endDate);
  let left = mapStartDateToTimeline(settings, start, parentOffset.left);
  const width = mapEndDateToWidth(settings, { start, end }, parentOffset.left);
  const adjustedWidth = adjustWidth(width, left, parentOffset);

  return (
    <div
      css={`
        position: absolute;
        left: ${left}px;
        width: ${adjustedWidth}px;

        background: ${phaseBgMap[data.phase || 'default'].bg};
        color: ${phaseBgMap[data.phase || 'default'].color};
        border: 1px solid #999;
        border-radius: 2px;
        padding: 8px;

        display: flex;
        align-items: center;
        justify-content: space-between;
      `}
    >
      {data.name} {false && { left } / { adjustedWidth }}
      {false && <span>{`${formatDate(data.startDate)} - ${formatDate(data.endDate)}`}</span>}
    </div>
  );
};
Child.propTypes = {
  data: PropTypes.shape({
    startDate: PropTypes.number,
    endDate: PropTypes.number,
  }).isRequired,
  settings: PropTypes.object,
  parentOffset: PropTypes.shape({
    left: PropTypes.number,
    width: PropTypes.number,
  }),
};

const ChildRow = ({ data, settings, parentOffset }) => {
  // console.log('row data: ', data);
  return (
    <div
      css={`
        position: relative;
        border: 0px solid red;
        min-height: 40px;
        margin-top: 4px;
        margin-bottom: 4px;
      `}
    >
      {mapIndex((child, idx) => (
        <Child key={idx} data={child} settings={settings} parentOffset={parentOffset} />
      ))(data)}
    </div>
  );
};
ChildRow.propTypes = {
  data: PropTypes.array.isRequired,
  settings: PropTypes.object,
  parentOffset: PropTypes.object,
};

export const ChildContainer = ({ project, settings, parentOffset }) => {
  const { children } = project;
  //
  // group the children as follows
  // - starting with the first child, group children until there is an overlap
  // - drop to a new group, add the overlapped, continue until next overlap
  //
  // at the end:
  // [
  //  [{A}, {B}],  <== A and B don't overlap
  //  [{C}],       <== C overlaps with B
  //  [{D}, {E}],  <== D overlaps with C, D and E don't overlap
  // ]
  //
  // then iterate over the outer list, one row per
  // - then iterate over the inner list, render all in one row
  //
  const a = R.reduce(
    (acc, val) => {
      // find the last entry in the current row
      // - if there isn't one, add the value to the current row
      // - if there is one, compare the end date to val.startDate
      //   - if they don't collide, add val to the currentRow
      //   - if they do, increment the currentRow, add the val to new currentRow
      const { last, values, currentRow } = acc;
      let newRow = currentRow;

      if (!last) {
        values[newRow] = [];
        values[newRow].push(val);
      } else {
        const collision = isAfter(last.endDate, val.startDate);
        // console.log('last.endDate, val.StartDate: ', last.endDate, val.startDate, collision);
        if (collision) {
          newRow++;
          values[newRow] = [];
          values[newRow].push(val);
        } else {
          values[newRow].push(val);
        }
      }
      return {
        ...acc,
        values,
        currentRow: newRow,
        last: val,
      };
    },
    { values: [], currentRow: 0, last: undefined },
    children || []
  );
  const childRows = a.values;

  if (childRows.length === 0) return null;
  return (
    <div
      css={`
        background: initial;
        color: initial;
        background: rgba(246, 246, 246, 0.5);
        border: 1px solid #ccc;
      `}
    >
      {mapIndex((cRow, idx) => (
        <ChildRow key={idx} data={cRow} settings={settings} parentOffset={parentOffset} />
      ))(childRows)}
    </div>
  );
};
ChildContainer.propTypes = {
  project: PropTypes.object,
  settings: PropTypes.object,
  parentOffset: PropTypes.object,
};
