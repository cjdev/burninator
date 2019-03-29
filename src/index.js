import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components/macro';

import { getTheme } from './themes';
import configureStore from './state/configureStore';

import App from './containers/App';
import * as Containers from './containers';

// This import should not be necessary, but
// without it the layout of the page does not work?
// eslint-disable-next-line no-unused-vars
import Board from './containers/Board';

import { getAuthProvider } from './auth';
const AuthCallbackRoute = getAuthProvider().callbackRoute;

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={getTheme()}>
        <App>
          <Switch>
            <Route exact path="/" component={Containers.AsyncHome} />
            <Route exact path="/board/:boardId/synopsis" component={Containers.AsyncSynopsis} />
            <Route exact path="/board/:boardId/snapshots" component={Containers.AsyncSnapshots} />
            <Route
              exact
              path="/board/:boardId/comparinator/:versions(.*)"
              component={Containers.AsyncComparinator}
            />
            <Route
              exact
              path="/board/:boardId/history/:versionId"
              component={Containers.AsyncBoard}
            />
            <Route exact path="/board/:boardId" component={Containers.AsyncBoard} />
            <Route path="/about" component={Containers.AsyncAbout} />
            <Redirect exact={true} from="/plans" to="/plans/1" />
            <Route path="/plans/:planId/:version?" component={Containers.AsyncPlaninator} />
            {AuthCallbackRoute && <AuthCallbackRoute />}
          </Switch>
        </App>
      </ThemeProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
