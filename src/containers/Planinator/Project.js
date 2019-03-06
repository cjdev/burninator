import React, { useState } from 'react';
import * as R from 'ramda';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { ChevronDownIcon, ChevronRightIcon } from '../../components/Icons';
import { formatDate, getUTCDate } from '../../utils';
import { ChildContainer } from './Children';
import { mapStartDateToTimeline, mapEndDateToWidth, phaseBgMap } from './utils';
import { useTitleCrawl } from './useTitleCrawl';
import { SettingsButton } from './ProjectSettings';

const getEarliestStart = R.pipe(
  R.sort(R.ascend(R.prop('startDate'))),
  R.pluck('startDate'),
  R.head
);
const getLatestEnd = R.pipe(
  R.sort(R.ascend(R.prop('endDate'))),
  R.pluck('endDate'),
  R.last
);

const getStartEnd = children => {
  return {
    startDate: getEarliestStart(children),
    endDate: getLatestEnd(children),
  };
};

export const Project = ({ project, settings, containerRef }) => {
  const showDates = false; //project.phase === 'build';
  const expandable = project.children !== undefined;
  const [expanded, toggleExpanded] = useState(false);

  // if the project has start and end, use them
  let start, end;
  if (project.startDate && project.endDate) {
    start = getUTCDate(project.startDate);
    end = getUTCDate(project.endDate);
  }
  // otherwise, derive from the children
  else {
    const dates = getStartEnd(project.children);
    start = getUTCDate(dates.startDate);
    end = getUTCDate(dates.endDate);
  }

  const left = mapStartDateToTimeline(settings, start);
  const width = mapEndDateToWidth(settings, { start, end });
  // console.log({ name: project.name, start, end, left, width });

  const [titleRef, titlePadding] = useTitleCrawl(containerRef);
  const [hover, setHover] = useState(false);

  const nameWithChevron = (
    <span
      css={`
        display: flex;
        align-items: center;
        cursor: pointer;
      `}
    >
      {expanded ? (
        <ChevronDownIcon
          css={`
            fill: #fff;
          `}
          onClick={() => toggleExpanded(!expanded)}
        />
      ) : (
        <ChevronRightIcon
          css={`
            fill: #fff;
          `}
          onClick={() => toggleExpanded(!expanded)}
        />
      )}
      <span onClick={() => toggleExpanded(!expanded)}>{project.name}</span>
    </span>
  );

  return (
    <div
      css={`
        min-height: 40px;
        margin-top: 8px;
        margin-bottom: 8px;
        position: relative;
        left: ${left}px;
        width: ${width}px;
        white-space: nowrap;
        z-index: 99;
      `}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #999;
          ${hover && `border: 1px solid #666;`}
          border-radius: 2px;
          padding: 8px;
          margin-bottom: 4px;
          background: ${phaseBgMap[project.phase || 'default'].bg};
          color: ${phaseBgMap[project.phase || 'default'].color};
          overflow-x: hidden;
        `}
      >
        <span
          ref={titleRef}
          css={`
            padding-left: ${titlePadding}px;
          `}
        >
          {expandable ? nameWithChevron : project.name}
        </span>

        <span>
          <span>{showDates && `${formatDate(start)} - ${formatDate(end)}`}</span>
          <SettingsButton projectSettings={project} hover={hover} />
        </span>
      </div>
      {expanded && (
        <ChildContainer project={project} settings={settings} parentOffset={{ left, width }} />
      )}
    </div>
  );
};
