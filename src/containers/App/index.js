import React from 'react';
import PropTypes from 'prop-types';
import Layout from '@cjdev/visual-stack-redux/lib/layouts/ApplicationLayout/index';
import { GlobalStyle, Normalize } from '../../globalStyles';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { AppSideNav } from './SideNav';

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
