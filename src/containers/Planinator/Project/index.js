import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { ChevronDownIcon, ChevronRightIcon } from '../../../components/Icons';
import { getUTCDate } from '../../../utils';
import { ChildContainer } from '../Children';
import { mapStartDateToTimeline, mapEndDateToWidth, phaseBgMap } from '../utils';
import { useTitleCrawl } from '../useTitleCrawl';
import { SettingsButton } from './Settings';
import { Tooltip } from '../../../components/Tooltips';
import { formatDate } from '../../../utils';

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

const getDates = project => {
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
  return { start, end };
};

export const Project = ({ project, settings, track, containerRef }) => {
  const expandable = project.children !== undefined;

  const { start, end } = useMemo(() => getDates(project), [project]);

  const left = mapStartDateToTimeline(settings, start);
  const width = mapEndDateToWidth(settings, { start, end });
  // console.log({ name: project.name, start, end, left, width });

  const [titleRef, titlePadding] = useTitleCrawl(containerRef);
  const [hover, setHover] = useState(false);

  const [expanded, toggleExpanded] = useState(false);
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
          border: 1px solid #999;
          ${hover && `border: 1px solid #666;`}
          border-radius: 2px;
          padding: 8px;
          margin-bottom: 4px;
          background: ${phaseBgMap[project.phase || 'default'].bg};
          color: ${phaseBgMap[project.phase || 'default'].color};
          overflow-x: hidden;
        `}
        data-for={project.id}
        data-tip
      >
        <span
          ref={titleRef}
          css={`
            padding-left: ${titlePadding}px;
            margin-right: 8px;
          `}
        >
          {expandable ? nameWithChevron : project.name}

          <Tooltip effect="solid" id={project.id}>
            <div>{project.name}</div>
            <div>{`${formatDate(start)} - ${formatDate(end)}`}</div>
          </Tooltip>
        </span>

        <SettingsButton
          css={`
            margin-top: -3px;
          `}
          project={project}
          track={track}
          hover={hover}
        />
      </div>
      {expanded && (
        <ChildContainer project={project} settings={settings} parentOffset={{ left, width }} />
      )}
    </div>
  );
};
Project.propTypes = {
  project: PropTypes.shape({
    startDate: PropTypes.number,
    endDate: PropTypes.number,
    children: PropTypes.array,
  }),
  settings: PropTypes.object,
  track: PropTypes.object,
  containerRef: PropTypes.object,
};
