import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';
import { formatOrEmpty, getJiraCompletedIterationLink } from '../../utils';
import Issues from './Issues';

const IterationContainer = styled.div`
  padding: 5px;
  margin-bottom: 10px;
`;

const IterationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  padding: 2px 5px;
  border-top: 1px solid #ccc;
  font-weight: 600;
  font-size: 1.2em;
`;

const HeaderName = styled.div`
  flex: 1;
`;

const Iteration = ({ iteration }) => (
  <IterationContainer>
    <IterationHeader>
      <HeaderName>
        {getJiraCompletedIterationLink(iteration)}
        {` (${iteration.totalPoints} points)`}
      </HeaderName>
      <div>
        {formatOrEmpty(iteration.startDate)}
        {' - '}
        {formatOrEmpty(iteration.completeDate)}
      </div>
    </IterationHeader>
    <Issues issues={iteration.issues} />
  </IterationContainer>
);
Iteration.propTypes = {
  iteration: PropTypes.shape({
    totalPoints: PropTypes.number.isRequired,
    startDate: PropTypes.string.isRequired,
    completedDate: PropTypes.number,
  }).isRequired,
};

export default Iteration;
