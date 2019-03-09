import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';

import { SpinnerPanel } from '../../components/Spinner';
import { Page, Header, Title } from '../../components/Page/';
import { Panel, PanelTitle } from '../../components/Panel';
import { getBoard } from '../../state/actions';
import { getCurrentBoard } from '../../state/reducer';
import { formatLongDate, formatOrEmpty } from '../../utils';

const Synopsis = ({ currentBoard, getBoard, match }) => {
  useEffect(() => {
    getBoard({ boardId: match.params.boardId, version: 'current' });
  }, [getBoard, match.params.boardId]);
  const { isLoaded, processed } = currentBoard;
  if (!isLoaded) {
    return <SpinnerPanel />;
  }
  const versions = processed.jiraVersions;
  const header = (
    <Header>
      <Helmet title="Synopsis" />
      <Title>Synopsis</Title>
    </Header>
  );

  return (
    <Page header={header}>
      <Panel>
        <PanelTitle>
          Release Plan Overview for {processed.backlogName} as of{' '}
          {formatLongDate(processed.lastUpdate)}
        </PanelTitle>
        {versions.map((v, i) => (
          <h2 key={i}>
            {formatOrEmpty(v.completedWeek)} through {formatOrEmpty(v.completedWeekPadded)} -{' '}
            {v.name}
          </h2>
        ))}
      </Panel>
    </Page>
  );
};
Synopsis.propTypes = {
  currentBoard: PropTypes.shape({
    processed: PropTypes.shape({
      jiraVersions: PropTypes.arrayOf(PropTypes.object).isRequired,
    }),
  }).isRequired,
  getBoard: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      boardId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default withRouter(
  connect(
    state => ({
      currentBoard: getCurrentBoard(state),
    }),
    { getBoard }
  )(Synopsis)
);
