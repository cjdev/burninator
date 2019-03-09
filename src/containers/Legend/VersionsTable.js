import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { dateIndicatesStaleBoard, getRelativeTime, formatShortDate } from '../../utils';
import { getCurrentBoard } from '../../state/reducer';
import { Panel, PanelTitle } from '../../components/Panel';
import { Table, Tr, Th, Td, TruncatingTd } from '../../components/Table/LegendTable';
import { formatDate, noName, getJiraBoardVersionLink } from '../../utils';

const Wrapper = styled.div`
  white-space: nowrap;
`;

const DangerTitle = styled(PanelTitle)`
  ${({ danger, theme }) =>
    danger &&
    `
      background-color: ${theme.danger.bg};
      color: ${theme.danger.color};
      padding: 3px;
      letter-spacing: .5px;
    `};
`;

const VersionsTable = ({ currentBoard }) => {
  const { processed, issueExceptions, versionName, versionArchive } = currentBoard;
  const { boardId, jiraVersions: versions, lastUpdate } = processed;
  const [relativeLastUpdate, setRelativeLastUpdate] = useState(getRelativeTime(lastUpdate));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRelativeLastUpdate(getRelativeTime(lastUpdate));
    }, 5000);
    return () => {
      window.clearInterval(timer);
    };
  }, [currentBoard, lastUpdate]);

  if (versions.length === 0) {
    return <div>No Versions!</div>;
  }
  const sortedVersions = R.sortBy(R.prop('completedWeekPadded'), versions);
  const issueExceptionsExist = issueExceptions.length > 0;
  const staleBoard = dateIndicatesStaleBoard(lastUpdate);

  return (
    <Panel>
      <DangerTitle danger={issueExceptionsExist || staleBoard}>
        <div>Release Plan</div>
        <div>
          {formatShortDate(lastUpdate)} | {relativeLastUpdate}
        </div>
        {issueExceptionsExist && <div>Excluded!</div>}
      </DangerTitle>
      {versionName && <PanelTitle>{versionName}</PanelTitle>}
      {versionArchive && <PanelTitle>Archived</PanelTitle>}
      <Wrapper>
        <Table>
          <thead>
            <Tr>
              <Th index>#</Th>
              <Th left max="true">
                Release / Milestone
              </Th>
              <Th right>Pts</Th>
              <Th right>Est</Th>
              <Th right>Outside</Th>
            </Tr>
          </thead>
          <tbody>
            {sortedVersions.map((v, i) => (
              <Tr key={i} active={v.active}>
                <Td index min="true">
                  {i + 1}
                </Td>
                <TruncatingTd title={v.name}>
                  {noName(v.name) ? '(No Version)' : getJiraBoardVersionLink(boardId, v.id, v.name)}
                </TruncatingTd>
                <Td right>{v.totalPointsLeft}</Td>
                <Td right>{formatDate(v.completedWeek)}</Td>
                <Td right>{formatDate(v.completedWeekPadded)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Wrapper>
    </Panel>
  );
};

VersionsTable.propTypes = {
  currentBoard: PropTypes.shape({
    processed: PropTypes.shape({
      jiraVersions: PropTypes.arrayOf(
        PropTypes.shape({
          active: PropTypes.bool,
          completedWeek: PropTypes.string,
          name: PropTypes.string,
          totalPoints: PropTypes.number,
        })
      ),
    }),
  }),
};

export default connect(state => ({ currentBoard: getCurrentBoard(state) }))(VersionsTable);
