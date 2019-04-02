import React from 'react';
import PlaninatorContext from '../context';
import { LoginPanelTitleRight } from '../LoginPanelTitleRight';
import { renderWithRedux } from '../../../testing/testing-utils';

const reducer = (state, action) => state;

const buildAuth = (requiresAuthValue = false, isAuthValue = false) => ({
  requiresAuthentication: () => requiresAuthValue,
  isAuthorized: () => isAuthValue,
});

const location = { pathname: '1/2/3' };

describe('<LoginPanelTitleRight/>', () => {
  test('should render', () => {
    const result = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider: buildAuth() }}>
        <LoginPanelTitleRight location={location} />
      </PlaninatorContext.Provider>
    );
    expect(result).not.toBeNull();
  });

  test('should render edit buttons when requiresAuth is false', () => {
    const requiresAuth = false;
    const { queryByTestId } = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider: buildAuth(requiresAuth) }}>
        <LoginPanelTitleRight location={location} />
      </PlaninatorContext.Provider>
    );

    expect(queryByTestId('add-track-button')).toBeInTheDocument();
  });

  test('should render edit buttons when isAuth is true', () => {
    const { queryByTestId } = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider: buildAuth(true, true) }}>
        <LoginPanelTitleRight location={location} />
      </PlaninatorContext.Provider>
    );

    expect(queryByTestId('add-track-button')).toBeInTheDocument();
  });

  test('should render login buttons when requiresAuth is true and no user', () => {
    const { queryByTestId } = renderWithRedux(reducer)(
      <PlaninatorContext.Provider value={{ authProvider: buildAuth(true, false) }}>
        <LoginPanelTitleRight location={location} />
      </PlaninatorContext.Provider>
    );

    expect(queryByTestId('login-button')).toBeInTheDocument();
  });
});
