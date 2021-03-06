import React, { useMemo, useContext, useState } from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { ChevronDownIcon, ChevronRightIcon } from '../../../components/Icons';
import { mapIndex } from '../../../utils';
import { Project } from '../Project';
import { useTitleCrawl } from '../useTitleCrawl';
import { getTodayAndPosition, getTimelineMarkerPositions } from '../utils';
import PlaninatorContext from '../context';
import { putPlan, getPlan } from '../api';
import { TrackTitle } from './TrackTitle';
import { BoardLink } from './BoardLink';
import { ButtonSet } from './ButtonSet';
import { TimeMarker } from './TimelineMarker';

export const Track = ({ track, position, containerRef }) => {
  const { state, planId, dispatch, version, authProvider, user } = useContext(PlaninatorContext);
  const { tracks, settings } = state;

  const editable = authProvider.isAuthorized(user);
  const timelineMarkers = useMemo(() => getTimelineMarkerPositions(settings), [settings]);
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
  const [hover, setHover] = useState(false);

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
      <TimeMarker pos={todayLeft} today={true} />
      {timelineMarkers.map(t => (
        <TimeMarker pos={t} key={t} />
      ))}
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
          onMouseOver={() => setHover(true)}
          onMouseOut={() => setHover(false)}
          css={`
            user-select: none;
            display: flex;
            align-items: center;
          `}
        >
          <TrackTitle onClick={() => toggleExpanded(!expanded)}>{track.name}</TrackTitle>
          {track.board && <BoardLink track={track} />}
          {editable && (
            <ButtonSet
              hover={hover}
              track={track}
              totalLength={tracks.length}
              position={position}
              onClickUp={handleClickUp}
              onClickDown={handleClickDown}
            />
          )}
        </div>
      </div>
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
