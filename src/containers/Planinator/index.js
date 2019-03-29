import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { ModalMountPoint } from '@cjdev/visual-stack-redux/lib/components/Modal';
import { Page, Header, Title } from '../../components/Page';
import { Panel, PanelTitle, PanelTitleLeft } from '../../components/Panel';
import { SpinnerPanel } from '../../components/Spinner';
import { Roadmap } from './Roadmap';
import { reducer, initialState } from './state';
import { getPlan } from './api';
import PlaninatorContext from './context';
import { useKnownBoards } from './useKnownBoards';
import { getAuthProvider } from '../../auth';
import { getUser } from '../../auth/userStorage';
import { LoginPanelTitleRight } from './LoginPanelTitleRight';

const authProvider = getAuthProvider();

const PlaninatorHeader = ({ noVersions, state }) => {
  return (
    <Header>
      <Helmet title="Planinator" />
      <Title>Planinator</Title>
    </Header>
  );
};
PlaninatorHeader.propTypes = {
  noVersions: PropTypes.bool,
  state: PropTypes.any,
};

const Planinator = ({ match, location }) => {
  const knownBoards = useKnownBoards();
  const user = getUser();

  const { planId, version } = match.params;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { apiMeta } = state;

  const noVersions = apiMeta.error === 'Not found';
  const otherError = apiMeta.error && !noVersions;

  useEffect(() => {
    getPlan(planId, version, dispatch);
  }, [planId, version]);

  if (apiMeta.loading) {
    return <SpinnerPanel />;
  }

  return (
    <PlaninatorContext.Provider
      value={{ state, dispatch, planId, version, knownBoards, user, authProvider }}
    >
      <Page header={<PlaninatorHeader state={state} noVersions={noVersions} />}>
        <Panel>
          {noVersions ? (
            <div>No plan found. Click the start button to get started.</div>
          ) : otherError ? (
            <div>Error: {apiMeta.error}?</div>
          ) : (
            <>
              <PanelTitle>
                <PanelTitleLeft>{state.settings.name}</PanelTitleLeft>
                <LoginPanelTitleRight state={state} noVersions={noVersions} location={location} />
              </PanelTitle>
              <Roadmap />
            </>
          )}
        </Panel>
        <ModalMountPoint />
      </Page>
    </PlaninatorContext.Provider>
  );
};
Planinator.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      planId: PropTypes.string.isRequired,
      version: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default withRouter(Planinator);
