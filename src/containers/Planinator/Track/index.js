import React, { useContext, useState } from 'react';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { ChevronDownIcon, ChevronRightIcon } from '../../../components/Icons';
import { mapIndex } from '../../../utils';
import { Project } from '../Project';
import { useTitleCrawl } from '../useTitleCrawl';
import { getTodayAndPosition } from '../utils';
import PlaninatorContext from '../context';
import { SettingsButton } from './Settings';

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

export const Track = ({ track, containerRef }) => {
  const { state } = useContext(PlaninatorContext);
  const { settings } = state;
  const [expanded, toggleExpanded] = useState(true);
  const [titleRef, titlePadding] = useTitleCrawl(containerRef);
  const [hover, setHover] = useState(false);

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
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
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
            cursor: pointer;
            display: flex;
            align-items: center;
            // background: #ccc;
          `}
        >
          <span
            css={`
              display: inline-block;
              margin-right: 4px;
              font-size: inherit;
            `}
            onClick={() => toggleExpanded(!expanded)}
          >
            {track.name}
          </span>
          <SettingsButton track={track} settings={settings} hover={hover} />
        </div>
      </div>
      <TodayMarker pos={todayLeft} />
      {expanded && (
        <div>
          {mapIndex((p, idx) => (
            <Project key={idx} project={p} settings={settings} containerRef={containerRef} />
          ))(track.projects || [])}
        </div>
      )}
    </div>
  );
};
