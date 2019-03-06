import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import { Table, Th, Td } from '../Table';
import { formatDate } from '../../utils';
import { KeyAndSummary, Status, Epic, Version, Points } from './IssueListRow';

const PointsMobile = styled(Points)`
  text-align: left;
`;

const TableWrapper = styled.div`
  border-bottom: 1px solid #ccc;
  padding-bottom: 8px;
  margin-bottom: 8px;
`;

const ThStack = ({ children, ...props }) => (
  <Th w="1%" {...props}>
    {children}
  </Th>
);
ThStack.propTypes = {
  children: PropTypes.any,
};

export const IssueListStack = ({ issue, ordinal }) => {
  return (
    <TableWrapper>
      <Table>
        <tbody>
          <tr>
            <ThStack>{ordinal}</ThStack>
            <Td ellipsis>
              <KeyAndSummary issue={issue} />
            </Td>
          </tr>
          <tr>
            <ThStack>Status</ThStack>
            <Status name={issue.status.name}>{issue.status.name}</Status>
          </tr>
          <tr>
            <ThStack>Epic</ThStack>
            <Epic name={issue.epic.name} last={issue.isFinalInEpic || undefined}>
              {issue.epic.name}
            </Epic>
          </tr>
          <tr>
            <ThStack>Version</ThStack>
            <Version name={issue.version} last={issue.isFinalInVersion || undefined}>
              {issue.version}
            </Version>
          </tr>
          <tr>
            <ThStack>Points</ThStack>
            <PointsMobile points={issue.points}>{issue.points}</PointsMobile>
          </tr>
          <tr>
            <ThStack>Estimate</ThStack>
            <Td>
              {formatDate(issue.completedWeek)} - {formatDate(issue.completedWeekPadded)}
            </Td>
          </tr>
        </tbody>
      </Table>
    </TableWrapper>
  );
};
IssueListStack.propTypes = {
  issue: PropTypes.object.isRequired,
  ordinal: PropTypes.number.isRequired,
};
