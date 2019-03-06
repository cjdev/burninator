import React, { useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { ModalMountPoint } from '@cjdev/visual-stack-redux/lib/components/Modal';
import { Page, Header, Title, HeaderRight } from '../../components/Page';
import { Panel, PanelTitle, PanelTitleLeft, PanelTitleRight } from '../../components/Panel';
import { SpinnerPanel } from '../../components/Spinner';
import { SettingsButton } from './SettingsModal';
import { Roadmap } from './Roadmap';
import { reducer, initialState } from './state';
import { getPlan } from './api';

export const PlaninatorDispatch = React.createContext(null);

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

const Planinator = ({ match }) => {
  const { planId, version } = match.params;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { settings, tracks, apiMeta } = state;
  // console.log('apiMeta: ', apiMeta);

  const noVersions = apiMeta.error === 'Not found';
  const otherError = apiMeta.error && !noVersions;

  useEffect(() => {
    getPlan(planId, version, dispatch);
  }, []);

  if (apiMeta.loading) {
    return <SpinnerPanel />;
  }

  return (
    <PlaninatorDispatch.Provider value={dispatch}>
      <Page header={<PlaninatorHeader state={state} noVersions={noVersions} />}>
        <Panel>
          {noVersions ? (
            <div>No plan found. Click the start button to get started.</div>
          ) : otherError ? (
            <div>Error: {apiMeta.error}?</div>
          ) : (
            <Roadmap settings={settings} tracks={tracks} />
          )}
        </Panel>
        <ModalMountPoint />
      </Page>
    </PlaninatorDispatch.Provider>
  );
};

export default withRouter(Planinator);
