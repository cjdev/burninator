import React, { useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import * as R from 'ramda';
import differenceInMonths from 'date-fns/difference_in_months';
import addMonths from 'date-fns/add_months';
import format from 'date-fns/format';
import getMonth from 'date-fns/get_month';
import getYear from 'date-fns/get_year';
import startOfMonth from 'date-fns/start_of_month';
import { Track } from '../Track';
import { getUTCDate, mapIndex } from '../../../utils';
import { getTodayAndPosition } from '../utils';
import PlaninatorContext from '../context';

const RoadmapContainer = styled.div`
  padding: 8px;
  margin: 0;
  width: calc(100vw - 120px);
  height: calc(100vh - 120px);
  border: 1px solid #ccc;
  border-radius: 2px;
  background: #f6f6f6;

  overflow-x: auto;
  overflow-y: auto;
`;

const getQuarterMark = date => {
  const m = getMonth(date);
  if (m === 0) return 1;
  if (m === 3) return 2;
  if (m === 6) return 3;
  if (m === 9) return 4;
};

const Months = styled.div`
  display: flex;
`;

const Month = ({ date, width }) => {
  const year = getYear(date);
  let q = getQuarterMark(date);
  q = q && `Q${q} ${year}`;

  return (
    <div
      css={`
        background: #f6f6f6;
        min-width: ${width}px; // ~3px/day
        padding: 0 4px;
        color: #999;
        font-variant: all-small-caps;
        text-transform: uppercase;
        & div {
          font-size: 1.2em;
        }
      `}
    >
      <div>{q}&nbsp;</div>
      <div>{format(date, 'MMM')}</div>
    </div>
  );
};
Month.propTypes = {
  date: PropTypes.object,
  width: PropTypes.number,
};

export const Roadmap = () => {
  const { state } = useContext(PlaninatorContext);
  const { settings, tracks = [] } = state;

  const containerRef = useRef(null);
  const { monthWidthPx } = settings;
  const startDateUTC = getUTCDate(settings.startDate);
  const endDateUTC = getUTCDate(settings.endDate);

  const startMonth = startOfMonth(startDateUTC);
  const numMonths = differenceInMonths(endDateUTC, startDateUTC);
  const width = numMonths * monthWidthPx;

  useEffect(() => {
    const { left } = getTodayAndPosition(settings);
    const leftWithBuffer = Math.max(0, left - 200);
    containerRef.current.scrollTo(leftWithBuffer, 0);
  }, [settings, tracks]);

  return (
    <RoadmapContainer ref={containerRef}>
      <Months>
        {mapIndex(i => (
          <Month key={i} width={monthWidthPx} date={addMonths(startMonth, i)}>
            {i}
          </Month>
        ))(R.range(0, numMonths))}
      </Months>
      <div
        css={`
          width: ${width}px;
        `}
      >
        {mapIndex((t, idx) => (
          <Track key={idx} position={idx} track={t} containerRef={containerRef} />
        ))(tracks)}
      </div>
    </RoadmapContainer>
  );
};
Roadmap.propTypes = {
  settings: PropTypes.shape({
    monthWidthPx: PropTypes.number,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  tracks: PropTypes.array,
};
