import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Panel, PanelTitle } from '../Panel';
import Iteration from './Iteration';
import { getCurrentBoard } from '../../state/reducer';
import { sortByCompletedDate } from '../../utils';

const Iterations = ({ sprints: iterations = [] }) => (
  <Panel>
    <PanelTitle>Iteration History</PanelTitle>
    {R.pipe(
      R.filter(i => i.state === 'closed'),
      R.sort(sortByCompletedDate),
      R.map(i => <Iteration iteration={i} key={`${i.name}-${i.completeDate}`} />)
    )(iterations)}
  </Panel>
);
Iterations.propTypes = {
  sprints: PropTypes.arrayOf(
    PropTypes.shape({
      state: PropTypes.string,
      completeDate: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
};

export default connect(state => ({
  sprints: getCurrentBoard(state).processed.boardData.sprints,
}))(Iterations);
