import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import styled from 'styled-components/macro';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getCurrentBoard } from '../../state/reducer';
import { Panel, PanelTitle, PanelTitleRight } from '../../components/Panel';
import CompletedIterationsTable from './CompletedIterationsTable';
import CurrentIterationTable from './CurrentIterationTable';
import { LinkButton } from '../../components/Button';

const Wrapper = styled.div`
  white-space: nowrap;
`;

const IterationsPanel = ({ currentBoard, fullHistory, onHistoryClick }) => {
  const { sprints: iterations } = currentBoard.processed.serverBoardData;
  const activeIteration = R.pipe(
    R.filter(s => s.state === 'active'),
    R.head
  )(iterations);
  return (
    <Panel>
      <PanelTitle>
        Iterations
        <PanelTitleRight>
          <LinkButton onClick={onHistoryClick}>history</LinkButton>
        </PanelTitleRight>
      </PanelTitle>
      <Wrapper>
        <CurrentIterationTable activeIteration={activeIteration} iterations={iterations} />
        <CompletedIterationsTable iterations={iterations} fullHistory={fullHistory} />
      </Wrapper>
    </Panel>
  );
};
IterationsPanel.propTypes = {
  currentBoard: PropTypes.object,
  fullHistory: PropTypes.bool,
  onHistoryClick: PropTypes.func.isRequired,
};

export default withRouter(
  connect(state => ({ currentBoard: getCurrentBoard(state) }))(IterationsPanel)
);
