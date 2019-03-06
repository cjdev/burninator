import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link as RRLink } from 'react-router-dom';
import Layout from '@cjdev/visual-stack-redux/lib/layouts/ApplicationLayout/index';
import {
  Link,
  LinkContentWrapper,
  SideNav,
} from '@cjdev/visual-stack-redux/lib/components/SideNav';
import { GlobalStyle, Normalize } from '../../globalStyles';
import { Logo, BoardsIcon, PlaninatorIcon, SettingsIcon } from '../../components/Icons';

import { ErrorBoundary } from '../../components/ErrorBoundary';

const AppSideNavInternal = ({ history }) => (
  <SideNav
    initializedCollapsed={true}
    logo={<Logo onClick={() => history.push('/')} />}
    appName="burninator"
  >
    <Link hoverText="Boards">
      <RRLink to="/">
        <LinkContentWrapper
          icon={
            <div>
              <BoardsIcon />
            </div>
          }
          label="Boards"
        />
      </RRLink>
    </Link>
    {false && (
      <Link hoverText="Plans">
        <RRLink to="/plans">
          <LinkContentWrapper
            icon={
              <div>
                <PlaninatorIcon />
              </div>
            }
            label="Plans"
          />
        </RRLink>
      </Link>
    )}
    <Link hoverText="Settings">
      <RRLink to="/about">
        <LinkContentWrapper
          icon={
            <div>
              <SettingsIcon />
            </div>
          }
          label="Settings"
        />
      </RRLink>
    </Link>
  </SideNav>
);
AppSideNavInternal.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
const AppSideNav = withRouter(AppSideNavInternal);

const App = ({ children }) => (
  <>
    <Normalize />
    <GlobalStyle />
    <Layout sideNav={<AppSideNav />}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Layout>
  </>
);
App.propTypes = {
  children: PropTypes.node,
};

export default App;
