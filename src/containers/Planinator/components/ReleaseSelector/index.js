import React, { useContext, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'; // eslint-disable-line no-unused-vars
import ReactSelector from 'react-select';
import * as R from 'ramda';
import { Spinner } from '../../../../components/Spinner';
import { fetchBoard } from '../../../../api';
import Board from '../../../../domain/Board';
import PlaninatorContext from '../../context';

const Select = styled(ReactSelector)`
  margin-bottom: 0.8rem;
`;

const getBoardDetails = (allBoards, board) =>
  allBoards ? allBoards.find(b => b.boardId === String(board)) : null;

export const ReleaseSelector = ({ board, ...rest }) => {
  const { knownBoards } = useContext(PlaninatorContext);
  const boardDetails = useMemo(() => getBoardDetails(knownBoards.values, board), [
    knownBoards,
    board,
  ]);
  const [releases, setReleases] = useState(null);
  useEffect(() => {
    fetchBoard(board, 'current').then(boardData => {
      const b = new Board(board, boardData);
      const releases = R.pipe(
        R.filter(v => v.id !== 'undefined'),
        R.map(v => ({ value: v.id, label: v.name })),
        R.sortBy(R.prop('label'))
      )(b.jiraVersions);
      setReleases(releases);
    });
  }, [board]);

  return releases && boardDetails ? (
    <>
      <label>Releases from {boardDetails.backlogName}</label>
      <Select options={releases} {...rest} multi placeholder="Select releases..." />
    </>
  ) : (
    <div>
      <Spinner />
      <span
        css={`
          margin-left: 8px;
        `}
      >
        Loading...
      </span>
    </div>
  );
};
ReleaseSelector.propTypes = {
  board: PropTypes.number,
};
