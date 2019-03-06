import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro';

import * as T from '../../../components/Table';
import { zeroPoints } from '../../../components/Table/LegendTable';
import { formatDate } from '../../../utils';
import { Table, Td, Th, TooltipPanel, TooltipSection, TooltipTitle, Tr } from '../charting';

const ColorTr = styled(T.Tr)`
  ${props => props.points === 0 && zeroPoints};
`;

const Highlighter = styled.span`
  color: ${props => (props.on ? '#333' : '#ccc')};
  font-size: inherit;
`;

const CustomTooltipIssueRow = ({ issue, currentWeek }) => {
  const isCurrent = w => currentWeek === w;
  return (
    <ColorTr points={issue.points}>
      <Td bold>{issue.key}</Td>
      <Td nowrap>{issue.summary}</Td>
      <Td right w="1px">
        {issue.points}
      </Td>
      <Td right>
        <Highlighter on={isCurrent(issue.completedWeek)}>
          {formatDate(issue.completedWeek)}
        </Highlighter>
      </Td>
      <Td right>
        <Highlighter on={isCurrent(issue.completedWeekPadded)}>
          {formatDate(issue.completedWeekPadded)}
        </Highlighter>
      </Td>
    </ColorTr>
  );
};
CustomTooltipIssueRow.propTypes = {
  issue: PropTypes.object.isRequired,
  currentWeek: PropTypes.string.isRequired,
};

const CustomTooltipVersionRow = ({ issue, currentWeek }) => {
  const isCurrent = w => currentWeek === w;
  return (
    <Tr>
      <Td nowrap>{issue.version}</Td>
      <Td right w="1px">
        <Highlighter on={isCurrent(issue.completedWeek)}>
          {formatDate(issue.completedWeek)}
        </Highlighter>
      </Td>
      <Td right w="1px">
        <Highlighter on={isCurrent(issue.completedWeekPadded)}>
          {formatDate(issue.completedWeekPadded)}
        </Highlighter>
      </Td>
    </Tr>
  );
};
CustomTooltipVersionRow.propTypes = {
  issue: PropTypes.object.isRequired,
  currentWeek: PropTypes.string.isRequired,
};

const CustomTooltip2 = props => {
  if (!props.active) return null;
  if (!props.payload) return null;
  if (!props.payload[0]) return null;

  const { completedWeek, x, versions, ...tooltipIssues } = props.payload[0].payload;

  const tooltipIssueKeys = R.keys(tooltipIssues);
  const issues = R.filter(issue => tooltipIssueKeys.includes(issue.key))(props.issues);

  return (
    <TooltipPanel>
      <TooltipTitle>{x}</TooltipTitle>
      {versions.length > 0 && (
        <TooltipSection>
          <Table>
            <tbody>
              <Tr>
                <Th>Version</Th>
                <Th right>Estimated</Th>
                <Th right>Outside</Th>
              </Tr>
              {versions.map(i => (
                <CustomTooltipVersionRow key={i.key} issue={i} currentWeek={completedWeek} />
              ))}
            </tbody>
          </Table>
        </TooltipSection>
      )}
      <TooltipSection>
        <Table>
          <tbody>
            <Tr>
              <Th>Issue</Th>
              <Th>Summary</Th>
              <Th>Points</Th>
              <Th right>Estimated</Th>
              <Th right>Outside</Th>
            </Tr>
            {issues.map(i => (
              <CustomTooltipIssueRow key={i.key} issue={i} currentWeek={completedWeek} />
            ))}
          </tbody>
        </Table>
      </TooltipSection>
    </TooltipPanel>
  );
};
CustomTooltip2.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  issues: PropTypes.array,
};

export { CustomTooltip2 };
