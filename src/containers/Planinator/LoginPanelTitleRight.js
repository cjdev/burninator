import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { BasicButton } from '../../components/Button';
import { PanelTitleRight } from '../../components/Panel';
import PlaninatorContext from './context';
import { AddTrackButton } from './Track/AddTrack';
import { SettingsButton } from './PlanSettings';

const LoginButton = ({ authProvider, redirectPath, ...rest }) => (
  <BasicButton {...rest} onClick={() => authProvider.login(redirectPath)}>
    Login to Edit
  </BasicButton>
);
LoginButton.propTypes = {
  authProvider: PropTypes.object.isRequired,
  redirectPath: PropTypes.string.isRequired,
};

export const LoginPanelTitleRight = ({ location, noVersions, state }) => {
  const { authProvider, user } = useContext(PlaninatorContext);
  // 4 possible states:
  //   1. no authorization required
  //      ==> show edit buttons
  //   2. auth required, user authorized
  //      ==> show edit buttons
  //   3. auth required, user not logged in
  //      ==> show login button
  //   4. auth required, user not authorized
  //      ==> show message?
  const showEditButtons = !authProvider.requiresAuthentication() || authProvider.isAuthorized(user);
  const showLoginButton = authProvider.requiresAuthentication() && !user;
  const showUnauthorizedMessage = user && !authProvider.isAuthorized(user);
  // console.log({ showEditButtons, showLoginButton, showUnauthorizedMessage, user });

  return (
    <PanelTitleRight>
      {showEditButtons && (
        <>
          <AddTrackButton data-testid="add-track-button" />
          <SettingsButton name={noVersions ? 'Start' : 'Settings'} state={state} />
        </>
      )}
      {showLoginButton && (
        <LoginButton
          data-testid="login-button"
          authProvider={authProvider}
          redirectPath={location.pathname}
        />
      )}
      {showUnauthorizedMessage && <div>Edit not available</div>}
    </PanelTitleRight>
  );
};
LoginPanelTitleRight.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  noVersions: PropTypes.any,
  state: PropTypes.any,
};
