import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import isAfter from 'date-fns/is_after';
import { mapIndex } from '../../../utils';
import { Child } from './Child';

const ChildRow = ({ data, track, project, settings, parentOffset, containerRef }) => {
  return (
    <div
      css={`
        position: relative;
        min-height: 40px;
        margin: 4px 0;
      `}
    >
      {mapIndex((child, idx) => (
        <Child
          key={idx}
          data={child}
          track={track}
          project={project}
          settings={settings}
          parentOffset={parentOffset}
          containerRef={containerRef}
        />
      ))(data)}
    </div>
  );
};
ChildRow.propTypes = {
  project: PropTypes.object,
  track: PropTypes.object,
  data: PropTypes.array.isRequired,
  settings: PropTypes.object,
  parentOffset: PropTypes.object,
};

export const ChildContainer = ({ track, project, settings, parentOffset, containerRef }) => {
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
        color: initial;
        background: rgba(246, 246, 246, 0.5);
        border: 1px solid #ccc;
      `}
    >
      {mapIndex((cRow, idx) => (
        <ChildRow
          key={idx}
          data={cRow}
          track={track}
          project={project}
          settings={settings}
          parentOffset={parentOffset}
          containerRef={containerRef}
        />
      ))(childRows)}
    </div>
  );
};
ChildContainer.propTypes = {
  project: PropTypes.object,
  track: PropTypes.object,
  settings: PropTypes.object,
  parentOffset: PropTypes.object,
};
