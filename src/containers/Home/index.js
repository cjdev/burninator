import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getKnownBoards } from '../../state/actions';
import { getKnownBoards as getKnownBoardsSelector } from '../../state/reducer';
import { SpinnerPanel } from '../../components/Spinner';
import { BoardList } from './BoardList';

const Home = ({ onMount, boards }) => {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return <>{boards ? <BoardList boards={boards} /> : <SpinnerPanel />}</>;
};
Home.propTypes = {
  boards: PropTypes.array,
  onMount: PropTypes.func.isRequired,
};

export default connect(
  getKnownBoardsSelector,
  {
    onMount: getKnownBoards,
  }
)(Home);
