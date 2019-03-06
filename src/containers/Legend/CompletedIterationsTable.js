import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { getJiraCompletedIterationLink, mapIndex } from '../../utils';
import { Table, Tr, Th, Td } from '../../components/Table/LegendTable';
import { formatDate, sortByCompletedDate } from '../../utils';

const CompletedIterationsTable = ({ iterations, fullHistory }) => (
  <Table>
    <thead>
      <Tr className="border-bottom hr">
        <Th left max="true">
          Completed Iterations ({iterations.length})
        </Th>
        <Th right>Points</Th>
        <Th right>End Date</Th>
      </Tr>
    </thead>
    <tbody>
      {R.pipe(
        R.filter(R.propEq('state', 'closed')),
        R.sort(sortByCompletedDate),
        R.take(fullHistory ? iterations.length : 10),
        mapIndex((s, i) => (
          <Tr key={i}>
            <Td left>{getJiraCompletedIterationLink(s)}</Td>
            <Td right>{s.totalPoints}</Td>
            <Td right>{formatDate(s.completeDate)}</Td>
          </Tr>
        ))
      )(iterations)}
      <Tr>
        <Td left bold>
          Total Completed Points
        </Td>
        <Td right bold>
          {R.pipe(
            R.filter(R.propEq('state', 'closed')),
            R.map(R.prop('totalPoints')),
            R.sum
          )(iterations)}
        </Td>
        <Td />
      </Tr>
    </tbody>
  </Table>
);
CompletedIterationsTable.propTypes = {
  iterations: PropTypes.arrayOf(
    PropTypes.shape({
      state: PropTypes.string,
    })
  ),
  fullHistory: PropTypes.bool,
};

export default CompletedIterationsTable;
