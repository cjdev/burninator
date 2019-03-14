import React, { useContext, useState } from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { withRouter } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '../../../components/Icons';
import { mapIndex } from '../../../utils';
import { Project } from '../Project';
import { useTitleCrawl } from '../useTitleCrawl';
import { getTodayAndPosition } from '../utils';
import PlaninatorContext from '../context';
import { SettingsButton } from './Settings';
import { putPlan, getPlan } from '../api';
import { UpButton, DownButton } from './Buttons';
import { AddProjectButton } from './AddProject';
import { Tooltip } from '../../../components/Tooltips';
import { BoardsIcon } from '../../../components/Icons';

const TodayMarker = ({ pos }) => (
  <div
    css={`
      position: absolute;
      top: 0;
      left: ${pos - 2}px;
      width: 1px;
      height: 100%;
      border-left: 2px dashed #eee;
      z-index: 9;
    `}
  />
);
TodayMarker.propTypes = {
  pos: PropTypes.number.isRequired,
};

export const TrackPure = ({ history, track, position, containerRef }) => {
  const { state, planId, dispatch, version, knownBoards } = useContext(PlaninatorContext);
  const { tracks, settings } = state;

  const activeUpButton = position > 0;
  const activeDownButton = position < tracks.length - 1;

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
  const [hover, setHover] = useState(false);
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
        background: #fff;
        position: relative;
      `}
    >
      <div
        ref={titleRef}
        css={`
          padding-left: ${titlePadding}px;
          min-height: 40px;
          display: flex;
          align-items: center;
          // background: #999;
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
            // background: #ccc;
          `}
        >
          <span
            css={`
              display: inline-block;
              display: flex;
              align-items: center;
              margin-right: 4px;
              font-size: inherit;
              cursor: pointer;
            `}
            onClick={() => toggleExpanded(!expanded)}
          >
            {track.name}
          </span>
          {track.board && (
            <span
              onClick={() => {
                history.push(`/board/${track.board}`);
              }}
              css={`
                display: inline-block;
                margin-left: 4px;
                && {
                  border: 0;
                }
              `}
            >
              <Tooltip effect="solid" id={track.id}>
                Go to {knownBoards.byId[track.board].backlogName}
              </Tooltip>
              <BoardsIcon
                data-tip
                data-for={track.id}
                size={1.1}
                css={`
                  margin-top: -3px;
                  fill: currentColor;
                  cursor: pointer;
                  &:hover {
                    fill: #585858;
                  }
                  &:active {
                    fill: #333;
                  }
                `}
              />
            </span>
          )}
          <span
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            css={`
              padding: 0 8px;
              display: flex:
              align-items: center;
              justify-content: space-around;
                cursor: pointer;
              & > * {
                margin: 0 2px;
              }
 `}
          >
            <AddProjectButton track={track} hover={hover} />
            <DownButton hover={hover} onClick={handleClickDown} active={activeDownButton} />
            <UpButton hover={hover} onClick={handleClickUp} active={activeUpButton} />
            <SettingsButton track={track} hover={hover} />
          </span>
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
TrackPure.propTypes = {
  history: PropTypes.object.isRequired,
  track: PropTypes.shape({
    name: PropTypes.string,
    projects: PropTypes.array,
  }),
  containerRef: PropTypes.object,
  position: PropTypes.number.isRequired,
};
export const Track = withRouter(TrackPure);
