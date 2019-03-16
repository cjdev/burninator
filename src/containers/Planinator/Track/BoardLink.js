import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import PlaninatorContext from '../context';
import { Tooltip } from '../../../components/Tooltips';
import { BoardsIcon } from '../../../components/Icons';
import { daysSince } from '../utils';

export const BoardLink = ({ track }) => {
  const { knownBoards } = useContext(PlaninatorContext);
  const board = knownBoards.byId[track.board];
  const boardAge = daysSince(board.lastUpdate);
  const boardNeedsUpdate = boardAge > 47;

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
        <Tooltip effect="solid" id={track.id}>
          <div>Goto {board.backlogName}</div>
          {boardNeedsUpdate && <div>Board is {boardAge} days old! Please update</div>}
        </Tooltip>
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
