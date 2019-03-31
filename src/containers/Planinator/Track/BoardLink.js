import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import PlaninatorContext from '../context';
import { BoardTooltip } from '../components/BarTooltip';
import { BoardsIcon } from '../../../components/Icons';
import { MAX_ACCEPTABLE_BOARD_AGE, daysSince } from '../utils';

export const BoardLink = ({ track }) => {
  const { knownBoards } = useContext(PlaninatorContext);
  const board = knownBoards.byId[track.board];
  const boardAge = daysSince(board.lastUpdate);
  const boardNeedsUpdate = boardAge > MAX_ACCEPTABLE_BOARD_AGE;
  const iconColor = boardNeedsUpdate ? 'red' : 'currentColor';

  return (
    <a href={`/board/${board.boardId}`} rel="noopener noreferrer" target="_blank">
      <span
        css={`
          display: inline-block;
          margin-left: 4px;
          && {
            border: 0;
          }
        `}
      >
        <BoardTooltip data={{ ...track, backlogName: board.backlogName }} age={boardAge} />
        <BoardsIcon
          data-tip
          data-for={track.id}
          size={1.1}
          css={`
            margin-top: -3px;
            fill: ${iconColor};
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
    </a>
  );
};
BoardLink.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.string,
    board: PropTypes.number,
  }),
};
