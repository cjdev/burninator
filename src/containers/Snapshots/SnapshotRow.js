import React from 'react';
import styled from 'styled-components/macro';
import PT from 'prop-types';
import { Link } from 'react-router-dom';
import { Tr, Td } from '../../components/Table';
import { getRelativeTime, formatLongDate } from '../../utils';
import { RenameButton } from './RenameModal';
import { ArchiveButton } from './ArchiveModal';

const p = millisStr => parseInt(millisStr, 10);

const LinkToBoard = ({ boardId, snapshot, children }) => (
  <Link to={`/board/${boardId}/history/${snapshot.lastUpdate}`}>{children}</Link>
);
LinkToBoard.propTypes = {
  boardId: PT.string.isRequired,
  children: PT.node,
  snapshot: PT.shape({
    lastUpdate: PT.number.isRequired,
  }).isRequired,
};
const IconSet = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SnapshotRow = ({ rowNum, snapshot, boardId }) => {
  const { lastUpdate, versionArchive, versionName } = snapshot;
  return (
    <Tr>
      <Td center>{rowNum}</Td>
      <Td>
        <LinkToBoard boardId={boardId} snapshot={snapshot}>
          {versionName}
        </LinkToBoard>
      </Td>
      <Td right>
        <LinkToBoard boardId={boardId} snapshot={snapshot}>
          {getRelativeTime(p(lastUpdate))}
        </LinkToBoard>
      </Td>
      <Td right>
        <LinkToBoard boardId={boardId} snapshot={snapshot}>
          {formatLongDate(p(lastUpdate))}
        </LinkToBoard>
      </Td>
      <Td right>
        <LinkToBoard boardId={boardId} snapshot={snapshot}>
          {lastUpdate}
        </LinkToBoard>
      </Td>
      <Td right>{versionArchive && 'Archived'}</Td>
      <Td right>
        <IconSet>
          <RenameButton boardId={boardId} snapshot={snapshot} />
          <ArchiveButton boardId={boardId} snapshot={snapshot} />
        </IconSet>
      </Td>
    </Tr>
  );
};
SnapshotRow.propTypes = {
  boardId: PT.string.isRequired,
  rowNum: PT.number.isRequired,
  snapshot: PT.object.isRequired,
};
