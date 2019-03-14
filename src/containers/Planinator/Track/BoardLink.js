import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import PlaninatorContext from '../context';
import { Tooltip } from '../../../components/Tooltips';
import { BoardsIcon } from '../../../components/Icons';

export const BoardLink = ({ track }) => {
  const { knownBoards } = useContext(PlaninatorContext);
  return (
    <a href={`/board/${track.board}`} rel="noopener noreferrer" target="_blank">
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
    </a>
  );
};
BoardLink.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.string,
    board: PropTypes.number,
  }),
};
