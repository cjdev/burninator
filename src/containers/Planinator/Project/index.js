import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { ChevronDownIcon, ChevronRightIcon } from '../../../components/Icons';
import { getUTCDate } from '../../../utils';
import { ChildContainer } from '../Children';
import { tsToDateString, mapStartDateToTimeline, mapEndDateToWidth, phaseBgMap } from '../utils';
import { useTitleCrawl } from '../useTitleCrawl';
import PlaninatorContext from '../context';
import { SettingsButton } from './Settings';
import { BarTooltip } from '../components/BarTooltip';
import { LinkIcon } from '../../../components/Icons';

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

const MIN_WIDTH = 100;

const ButtonSet = ({ project, track, hover }) => {
  const { authProvider, user } = useContext(PlaninatorContext);
  const editable = authProvider.isAuthorized(user);
  return (
    <div
      css={`
        display: ${hover ? `flex` : `none`};
        justify-content: center;
      `}
    >
      {project.link && (
        <a
          css={`
            && {
              text-decoration: none;
              border-bottom: 0;
              color: currentColor;
            }
            &&:hover {
              text-decoration: none;
              border-bottom: 0;
              color: currentColor;
            }
          `}
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkIcon
            css={`
              margin-top: -3px;
              margin-left: 4px;
              margin-right: 4px;
              fill: currentColor;
              &:hover {
                fill: #ddd;
              }
              &:active {
                fill: #bbb;
              }
            `}
            size={1}
          />
        </a>
      )}
      {editable && (
        <SettingsButton
          css={`
            margin-top: -3px;
            margin-left: 4px;
          `}
          project={project}
          track={track}
          hover={hover}
        />
      )}
    </div>
  );
};

export const Project = ({ project, settings, track, containerRef }) => {
  const expandable = project.children !== undefined;

  const { start, end } = useMemo(() => getDates(project), [project]);

  const left = mapStartDateToTimeline(settings, start);
  let width = mapEndDateToWidth(settings, { start, end });
  width = Math.max(width, MIN_WIDTH);
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
            min-width: 2.25rem;
          `}
          onClick={() => toggleExpanded(!expanded)}
        />
      ) : (
        <ChevronRightIcon
          css={`
            fill: #fff;
            min-width: 2.25rem;
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
        data-for={project.id}
        data-tip
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
      >
        <div
          ref={titleRef}
          css={`
            padding-left: ${titlePadding}px;
            overflow-x: hidden;
            margin-right: 4px;
          `}
        >
          <BarTooltip data={{ ...project, startDate: start, endDate: end }} />
          {expandable ? nameWithChevron : project.name}
        </div>
        <ButtonSet project={project} track={track} hover={hover} />
      </div>
      {expanded && (
        <ChildContainer
          track={track}
          project={project}
          settings={settings}
          parentOffset={{ left, width }}
          containerRef={containerRef}
        />
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
