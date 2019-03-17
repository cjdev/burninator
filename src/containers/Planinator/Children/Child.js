import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { getUTCDate } from '../../../utils';
import { tsToDateString, mapStartDateToTimeline, mapEndDateToWidth, phaseBgMap } from '../utils';
import { Tooltip } from '../../../components/Tooltips';
import { SettingsButton } from './Settings';

const MIN_WIDTH = 30;

//
// The naive happy path is to translate startDate and endDate to a left and
// width and render.
//
// For first children:
// * left will == 0
// * left => 2
// * width => width - 2
//
// For final children, with width < MIN:
// * width => MIN
// * left => left - (MIN - width)
//
const adjust = (naturalLeft, naturalWidth, parentOffset) => {
  let adjustedWidth = naturalWidth;
  let adjustedLeft = naturalLeft;

  if (naturalWidth < MIN_WIDTH) {
    const diff = MIN_WIDTH - naturalWidth;
    adjustedWidth = MIN_WIDTH;
    adjustedLeft -= diff;
  }

  if (naturalLeft <= 0) {
    adjustedLeft = 3;
    adjustedWidth -= 3;
  }

  // if the adjustedLeft+adjustedWidth > parentOffset.width + padding)
  // * reduce the left enough to fit
  const adjustedRight = adjustedLeft + adjustedWidth;
  const diff = adjustedRight - parentOffset.width + 5;
  if (diff > 0) {
    adjustedLeft -= diff;
  }

  return {
    adjustedLeft,
    adjustedWidth,
  };
};

export const Child = ({ data, track, project, settings, parentOffset = { left: 0, width: 0 } }) => {
  const start = getUTCDate(data.startDate);
  const end = getUTCDate(data.endDate);

  let left = mapStartDateToTimeline(settings, start, parentOffset.left);
  const width = mapEndDateToWidth(settings, { start, end }, parentOffset.left);
  const { adjustedLeft, adjustedWidth } = adjust(left, width, parentOffset);
  // console.log(`[${data.name}]: ${left} => ${adjustedLeft}, ${width} => ${adjustedWidth}`);
  // useEffect(() => {
  //   console.log({
  //     name: data.name,
  //     left,
  //     adjustedLeft,
  //     width,
  //     adjustedWidth,
  //     start,
  //     end,
  //   });
  // }, []);

  const [hover, setHover] = useState(false);

  return (
    <>
      <div
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
        css={`
          position: absolute;
          left: ${adjustedLeft}px;
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
        data-for={data.id}
        data-tip
      >
        <Tooltip effect="solid" id={data.id}>
          <div>{data.name}</div>
          <div>{`${tsToDateString(data.startDate)} - ${tsToDateString(data.endDate)}`}</div>
        </Tooltip>
        <div
          css={`
            overflow-x: hidden;
          `}
        >
          {data.name}
        </div>
        <SettingsButton
          css={`
            margin-top: -3px;
            margin-left: 4px;
          `}
          project={project}
          track={track}
          child={data}
          hover={hover}
        />
      </div>
    </>
  );
};
Child.propTypes = {
  data: PropTypes.shape({
    startDate: PropTypes.number,
    endDate: PropTypes.number,
  }).isRequired,
  settings: PropTypes.object,
  project: PropTypes.object,
  track: PropTypes.object,
  parentOffset: PropTypes.shape({
    left: PropTypes.number,
    width: PropTypes.number,
  }),
};
