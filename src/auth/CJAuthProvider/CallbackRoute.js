import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { SpinnerPanel } from '../../components/Spinner';
import { Page } from '../../components/Page';
import { Panel } from '../../components/Panel';
import { storeUser } from '../userStorage';
import { getUser, isValidUser, getOauthData } from './authClient';
import { redirectPath } from './config';

const processCallback = async (href, history) => {
  const oauthData = await getOauthData(href);
  const user = await getUser(oauthData.token);
  if (isValidUser(user)) {
    storeUser(user);
    history.push(oauthData.redirectPath);
  }
  // else?
};

const CJAuthCallback = ({ history }) => {
  const [state, setState] = useState(null);
  useEffect(() => {
    try {
      processCallback(window.location.href, history);
    } catch (err) {
      setState(err);
    }
  }, [history]);
  return (
    <Page>
      {state ? (
        <Panel>
          <div>Error: {JSON.stringify(state)}</div>
        </Panel>
      ) : (
        <SpinnerPanel />
      )}
    </Page>
  );
};
CJAuthCallback.propTypes = {
  history: PropTypes.object,
};

export const CallbackRoute = () => (
  <Route path={redirectPath} component={withRouter(CJAuthCallback)} />
);
