import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components/macro';
import { ellipsis } from 'polished';
import { Tr, Td } from '../Table';
import { getJiraIssueLink, formatDate } from '../../utils';
import { AlertTooltip } from '../../components/Tooltips';
import { AlertButton, CloseButton } from '../../components/Button';

const highlight = css`
  ${({ highlight }) => highlight === 'highlight' && `font-weight: 600;`};
`;

const lastActive = `
  border-bottom: 2px solid #bebebe !important;
`;

const greenCell = css`
  ${({ theme }) => `
    border-left: ${theme.issueList.green.border};
    background-color: ${theme.issueList.green.bg};
  `};
`;

const blueCell = css`
  ${({ theme }) => `
    border-left: ${theme.issueList.blue.border};
    background-color: ${theme.issueList.blue.bg};
  `};
`;

const yellowCell = css`
  ${({ theme }) => `
    border-left: ${theme.issueList.yellow.border};
    background-color: ${theme.issueList.yellow.bg};
  `};
`;

const redCell = css`
  ${({ theme }) => `
    border-left: ${theme.issueList.red.border};
    background-color: ${theme.issueList.red.bg};
  `};
`;

const Row = styled(Tr)`
  ${props => (props.issue.isLastActive ? lastActive : undefined)};
  ${({ highlight }) => {
    switch (highlight) {
      case 'highlight':
        return `
          background-color: #F6F6F6 !important;
        `;
      case 'fade':
        return `
          & *, & > td, & a, & div {
            color: #bbb !important;
            background-color: transparent !important;
          }
          & > td {
            border-left-color: transparent !important;
          }
        `;
      default:
        return '';
    }
  }};
  ${({ excepted, theme }) =>
    excepted &&
    `
    & > td, & a {
      text-decoration: line-through;
      color: ${theme.issueList.red.color};
      background-color: #F6F6F6;
    }
  `};
`;

const TypeTd = ({ issueType, ...props }) => <Td {...props} />;
export const Type = styled(TypeTd)`
  ${props => (props.issueType === 'SubTask' ? redCell : undefined)};
`;
TypeTd.propTypes = {
  issueType: PropTypes.string,
};

export const Status = styled(Td)`
  white-space: nowrap;
  ${highlight};
  ${({ name }) => {
    switch (name) {
      case 'In Progress':
      case 'Needs Demo':
      case 'Dev Done':
      case 'Needs QR':
      case 'Needs SOX':
      case 'Complete In Sprint':
        return blueCell;
      case 'Resolved':
        return yellowCell;
      case 'Closed':
        return greenCell;
      default:
        return '';
    }
  }};
`;

const EpicTd = ({ last, ...props }) => <Td ellipsis noselect {...props} />;
export const Epic = styled(EpicTd)`
  ${({ last }) => (last ? greenCell : undefined)};
`;
EpicTd.propTypes = {
  last: PropTypes.bool,
};

const VersionTd = ({ last, ...props }) => <Td noselect {...props} />;
export const Version = styled(VersionTd)`
  ${highlight};
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    font-weight: 600;
  }
  ${({ name, last }) => (name ? last && greenCell : redCell)};
`;
VersionTd.propTypes = {
  last: PropTypes.bool,
};

const PointsTd = ({ points, pointsLeft, ...props }) => <Td {...props} />;
PointsTd.propTypes = {
  points: PropTypes.number,
  pointsLeft: PropTypes.number,
};

export const Points = styled(PointsTd)`
  text-align: center;
  ${({ points }) => (!points || points > 8 ? redCell : '')};
  ${({ pointsLeft }) => !pointsLeft && 'color: #aaa; text-decoration: line-through;'};
`;

const ExceptedRowIcon = ({ issue, onToggleException }) => (
  <CloseButton onClick={() => onToggleException(issue.key)} />
);
ExceptedRowIcon.propTypes = {
  issue: PropTypes.shape({
    key: PropTypes.string.isRequired,
  }).isRequired,
  onToggleException: PropTypes.func.isRequired,
};

const AlertRowIcon = ({ index, stalledStatus: { isStalled, stalledMessage } }) => {
  return (
    isStalled && (
      <AlertButton data-tip data-for={index}>
        <AlertTooltip place="left" type="dark" effect="solid" id={index}>
          {stalledMessage}
        </AlertTooltip>
      </AlertButton>
    )
  );
};
AlertRowIcon.propTypes = {
  index: PropTypes.string,
  stalledStatus: PropTypes.shape({
    isStalled: PropTypes.bool,
    stalledMessage: PropTypes.string,
  }).isRequired,
};

const IconSet = styled.div`
  display: flex;
`;

const Summary = styled.div`
  ${ellipsis()};
  ${highlight};
  & a {
    border-bottom: 0px;
  }
`;

export const KeyAndSummary = ({ issue, highlight = false }) => (
  <div>
    <Summary highlight={highlight}>{getJiraIssueLink(issue, 'summary')}</Summary>
    <div>
      {getJiraIssueLink(issue, 'key')} | {issue.issueType}
    </div>
  </div>
);
KeyAndSummary.propTypes = {
  issue: PropTypes.object.isRequired,
  highlight: PropTypes.string,
};

const HighlightTd = styled(Td)`
  ${highlight};
`;

export const IssueListRow = ({ highlight, issue, onToggleException, onVersionClick, ordinal }) => {
  return (
    <Row issue={issue} highlight={highlight} excepted={issue.isExcepted || undefined}>
      <HighlightTd center w="1%" noselect highlight={highlight}>
        {ordinal}
      </HighlightTd>
      <Td ellipsis nowrap name={issue.status.name}>
        <KeyAndSummary issue={issue} highlight={highlight} />
      </Td>
      <Status w="1%" name={issue.status.name} highlight={highlight}>
        {issue.status.name}
      </Status>

      <Epic w="10%" name={issue.epic.name} last={issue.isFinalInEpic || undefined}>
        {issue.epic.name}
      </Epic>
      <Version
        w="10%"
        highlight={highlight}
        name={issue.version}
        last={issue.isFinalInVersion || undefined}
        onClick={() => onVersionClick(issue.version)}
      >
        {issue.version}
      </Version>
      <Points w="1%" points={issue.points} pointsLeft={issue.pointsLeft}>
        {issue.points}
      </Points>
      <HighlightTd w="1%" right highlight={highlight}>
        {formatDate(issue.completedWeek)}
      </HighlightTd>
      <HighlightTd w="1%" right highlight={highlight}>
        {formatDate(issue.completedWeekPadded)}
      </HighlightTd>
      <Td w="3%">
        <IconSet>
          <ExceptedRowIcon issue={issue} onToggleException={onToggleException} />
          <AlertRowIcon index={issue.key} stalledStatus={issue.stalledStatus} />
        </IconSet>
      </Td>
    </Row>
  );
};
IssueListRow.propTypes = {
  issue: PropTypes.object.isRequired,
  ordinal: PropTypes.number.isRequired,
  highlight: PropTypes.string,
  onVersionClick: PropTypes.func.isRequired,
  onToggleException: PropTypes.func.isRequired,
};
