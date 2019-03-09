import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { ModalMountPoint } from '@cjdev/visual-stack-redux/lib/components/Modal';
import { Page, Header, Title, HeaderRight } from '../../components/Page';
import { Panel } from '../../components/Panel';
import { SpinnerPanel } from '../../components/Spinner';
import { SettingsButton } from './PlanSettings';
import { Roadmap } from './Roadmap';
import { reducer, initialState } from './state';
import { getPlan } from './api';
import PlaninatorContext from './PlaninatorContext';

const PlaninatorHeader = ({ noVersions, state }) => {
  return (
    <Header>
      <Helmet title="Planinator" />
      <Title>Planinator</Title>
      <HeaderRight>
        <SettingsButton name={noVersions ? 'Start' : 'Settings'} state={state} />
      </HeaderRight>
    </Header>
  );
};
PlaninatorHeader.propTypes = {
  noVersions: PropTypes.bool,
  state: PropTypes.any,
};

const Planinator = ({ match }) => {
  const { planId, version } = match.params;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { apiMeta } = state;
  // console.log('apiMeta: ', apiMeta);

  const noVersions = apiMeta.error === 'Not found';
  const otherError = apiMeta.error && !noVersions;

  useEffect(() => {
    getPlan(planId, version, dispatch);
  }, [planId, version]);

  if (apiMeta.loading) {
    return <SpinnerPanel />;
  }

  return (
    <PlaninatorContext.Provider value={{ state, dispatch, planId, version }}>
      <Page header={<PlaninatorHeader state={state} noVersions={noVersions} />}>
        <Panel>
          {noVersions ? (
            <div>No plan found. Click the start button to get started.</div>
          ) : otherError ? (
            <div>Error: {apiMeta.error}?</div>
          ) : (
            <Roadmap />
          )}
        </Panel>
        <ModalMountPoint />
      </Page>
    </PlaninatorContext.Provider>
  );
};
Planinator.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      planId: PropTypes.string.isRequired,
      version: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default withRouter(Planinator);
