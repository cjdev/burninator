import React, { useContext, useState } from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { ChevronDownIcon, ChevronRightIcon } from '../../../components/Icons';
import { mapIndex } from '../../../utils';
import { Project } from '../Project';
import { useTitleCrawl } from '../useTitleCrawl';
import { getTodayAndPosition } from '../utils';
import PlaninatorContext from '../context';
import { putPlan, getPlan } from '../api';
import { TrackTitle } from './TrackTitle';
import { BoardLink } from './BoardLink';
import { ButtonSet } from './ButtonSet';
import { TodayMarker } from './TodayMarker';

export const Track = ({ track, position, containerRef }) => {
  const { state, planId, dispatch, version } = useContext(PlaninatorContext);
  const { tracks, settings } = state;

  const handleClickDown = async () => {
    const newPlan = {
      ...state,
      tracks: R.move(position, position + 1, state.tracks),
    };
    await putPlan(planId, newPlan, dispatch);
    getPlan(planId, version, dispatch);
  };

  const handleClickUp = async () => {
    const newPlan = {
      ...state,
      tracks: R.move(position, position - 1, state.tracks),
    };
    await putPlan(planId, newPlan, dispatch);
    // get the plan
    getPlan(planId, version, dispatch);
  };

  const [expanded, toggleExpanded] = useState(true);
  const [titleRef, titlePadding] = useTitleCrawl(containerRef);
  const { left: todayLeft } = getTodayAndPosition(settings);

  return (
    <div
      css={`
        ${expanded && 'min-height: 80px'};
        border: 1px solid #ccc;
        padding: 4px;
        margin: 8px 0;
        user-select: none;
        position: relative;
        background: #fff;
      `}
    >
      <div
        ref={titleRef}
        css={`
          padding-left: ${titlePadding}px;
          min-height: 40px;
          display: flex;
          align-items: center;
        `}
      >
        {expanded ? (
          <ChevronDownIcon css={'cursor: pointer;'} onClick={() => toggleExpanded(!expanded)} />
        ) : (
          <ChevronRightIcon css={'cursor: pointer;'} onClick={() => toggleExpanded(!expanded)} />
        )}
        <div
          css={`
            user-select: none;
            text-transform: uppercase;
            display: flex;
            align-items: center;
          `}
        >
          <TrackTitle onClick={() => toggleExpanded(!expanded)}>{track.name}</TrackTitle>
          {track.board && <BoardLink track={track} />}
          <ButtonSet
            track={track}
            totalLength={tracks.length}
            position={position}
            onClickUp={handleClickUp}
            onClickDown={handleClickDown}
          />
        </div>
      </div>
      <TodayMarker pos={todayLeft} />
      {expanded && (
        <div>
          {mapIndex((p, idx) => (
            <Project
              key={idx}
              track={track}
              project={p}
              settings={settings}
              containerRef={containerRef}
            />
          ))(track.projects || [])}
        </div>
      )}
    </div>
  );
};
Track.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string,
    projects: PropTypes.array,
  }),
  containerRef: PropTypes.object,
  position: PropTypes.number.isRequired,
};
