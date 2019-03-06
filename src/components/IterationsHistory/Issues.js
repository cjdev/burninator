import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import { Table, Tr, Td as TdBase, Th, THead } from '../Table';
import { getJiraIssueLink, formatOrEmpty } from '../../utils';

const reduceIndexed = R.addIndex(R.reduce);

const Td = ({ children, ...rest }) => (
  <TdBase padding="5px 8px" {...rest}>
    {children}
  </TdBase>
);
Td.propTypes = {
  children: PropTypes.any,
};

const completedRow = `
    color: inherit;
    & td, & a {
      color: #999;
    }
    background-color: #FAFAFA;
`;

const Row = styled(Tr)`
  ${props => (props.complete ? completedRow : 'color: #999;')};
`;

const getResolutionDate = R.view(R.lensPath(['resolution', 'date']));

const stati = ['Closed', 'Resolved', 'Needs SOX', 'Needs Demo', 'Dev Done', 'In Progress', 'Open'];

const statusSorted = reduceIndexed(
  (acc, status, idx) => ({
    ...acc,
    [status]: idx,
  }),
  {}
);
const statusSort = statusSorted(stati);

const getStatusSort = issue => {
  const s = R.view(R.lensPath(['status', 'name']), issue);
  return s ? statusSort[s] : Number.MAX_SAFE_INTEGER;
};

const Issues = ({ issues }) => {
  // sort The resovled first, Then by status
  const sorted = R.sort((a, b) => {
    const aR = a.resolvedInSprint;
    const bR = b.resolvedInSprint;
    // if boTh or neiTher are resolved in This sprint...
    if ((aR && bR) || (!aR && !bR)) {
      return getStatusSort(a) - getStatusSort(b);
    }
    if (aR) return -1;
    return 1;
  }, issues);
  return (
    <Table fixed>
      <THead>
        <Tr>
          <Th w="3%" right>
            Row
          </Th>
          <Th w="8%">Key</Th>
          <Th>Summary</Th>
          <Th w="6%">Type</Th>
          <Th w="8%">Status</Th>
          <Th w="7%">Date</Th>
          <Th w="5%" center>
            Closed
          </Th>
          <Th w="4%" center>
            Points
          </Th>
        </Tr>
      </THead>
      <tbody>
        {sorted.map((i, num) => (
          <Row key={num} complete={i.resolvedInSprint}>
            <Td right>{num + 1}</Td>
            <Td ellipsis>{getJiraIssueLink(i, 'key')}</Td>
            <Td ellipsis className="summary">
              {getJiraIssueLink(i, 'summary')}
            </Td>
            <Td ellipsis>{i.issueType}</Td>
            <Td ellipsis className="status" nowrap>
              {i.status.name}
            </Td>
            <Td>{formatOrEmpty(getResolutionDate(i))}</Td>
            <Td center>{i.resolvedInSprint ? 'Y' : ''}</Td>
            <Td center>{i.points}</Td>
          </Row>
        ))}
      </tbody>
    </Table>
  );
};
Issues.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      resolvedInSprint: PropTypes.bool.isRequired,
      status: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
    })
  ).isRequired,
};

export default Issues;
