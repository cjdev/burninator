import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import { getUTCDate } from '../../../utils';
import { mapStartDateToTimeline, mapEndDateToWidth, phaseBgMap } from '../utils';
import { BarTooltip } from '../components/BarTooltip';
import { SettingsButton } from './Settings';
import { useTitleCrawl } from '../useTitleCrawl';
import PlaninatorContext from '../context';
import { LinkIcon } from '../../../components/Icons';

const MIN_WIDTH = 30;

const ButtonSet = ({ data, project, track, hover }) => {
  const { authProvider, user } = useContext(PlaninatorContext);
  const editable = authProvider.isAuthorized(user);
  return (
    <div
      css={`
        display: ${hover ? `flex` : `none`};
        justify-content: center;
      `}
    >
      {data.link && (
        <a
          data-testid="buttonset-datalink"
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
          href={data.link}
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
          data-testid="buttonset-settingsbutton"
          css={`
            margin-top: -3px;
            margin-left: 4px;
          `}
          project={project}
          track={track}
          child={data}
          hover={hover}
        />
      )}
    </div>
  );
};

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

export const Child = ({
  data,
  track,
  project,
  settings,
  parentOffset = { left: 0, width: 0 },
  containerRef,
}) => {
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

  const [titleRef, titlePadding] = useTitleCrawl(containerRef);
  const [hover, setHover] = useState(false);

  return (
    <>
      <div
        ref={titleRef}
        data-testid="child"
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
          padding-left: ${Math.max(8, titlePadding)}px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        `}
        data-for={data.id}
        data-tip
      >
        <BarTooltip data={data} />
        <div
          css={`
            overflow-x: hidden;
          `}
        >
          {data.name}
        </div>
        <ButtonSet data={data} project={project} track={track} hover={hover} />
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
    left: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }),
};
