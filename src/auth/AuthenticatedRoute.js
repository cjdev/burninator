import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { getAuthProvider } from './';
const authProvider = getAuthProvider();

const AuthenticatedRoute = ({ component: Component, ...rest }) => {
  return authProvider.requiresAuthentication() ? (
    <div>TODO redirect to login</div>
  ) : (
    <Route {...rest} render={props => <Component {...props} />} />
  );
};
AuthenticatedRoute.propTypes = {
  component: PropTypes.func.isRequired,
};
