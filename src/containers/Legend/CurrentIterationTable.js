import React from 'react';
import * as R from 'ramda';
import PropTypes from 'prop-types';
import { Table, Tr, Th, Td } from '../../components/Table/LegendTable';
import { formatDate } from '../../utils';

const CurrentIterationTable = ({ activeIteration }) => {
  let row;
  if (activeIteration) {
    const getPoints = R.pluck('points');
    const totalPoints = R.sum(getPoints(activeIteration.issues));
    const closedPoints = R.sum(
      getPoints(R.filter(i => i.status.name === 'Closed', activeIteration.issues))
    );
    row = (
      <Tr>
        <Td left>{activeIteration.name}</Td>
        <Td right>{`${closedPoints} / ${totalPoints}`}</Td>
        <Td right>{formatDate(activeIteration.endDate)}</Td>
      </Tr>
    );
  }
  return (
    <Table>
      <thead>
        <Tr>
          <Th left max="true">
            Current Iteration
          </Th>
          <Th right>Completed/Total</Th>
          <Th right>End Date</Th>
        </Tr>
      </thead>
      <tbody>
        {!activeIteration ? (
          <Tr>
            <Td>No Active Iteration</Td>
          </Tr>
        ) : (
          row
        )}
      </tbody>
    </Table>
  );
};
CurrentIterationTable.propTypes = {
  activeIteration: PropTypes.shape({
    issues: PropTypes.arrayOf(
      PropTypes.shape({
        points: PropTypes.number,
        status: PropTypes.shape({
          name: PropTypes.string,
        }).isRequired,
      })
    ),
    name: PropTypes.string,
  }),
};

export default CurrentIterationTable;
