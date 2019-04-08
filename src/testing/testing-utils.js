import React from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';

import { render } from 'react-testing-library';
export * from 'react-testing-library';

export const simpleReducer = (state, action) => state;
export const loggingReducer = (state, action) => {
  console.log('action: ', action);
  return state;
};

export const renderWithRedux = reducer => (
  ui,
  { initialState, store = createStore(reducer, initialState) } = {}
) => {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    // adding `store` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    store,
  };
};

export const jsonResult = expected => ({
  json: () => Promise.resolve(expected),
});

export const response500 = (extras = {}) => () =>
  Promise.resolve({
    ok: false,
    statusText: 'Internal Server Error',
    ...extras,
  });

export const responseOk = (impl = {}) => () =>
  Promise.resolve({
    ok: true,
    statusText: 'OK',
    ...impl,
  });

export const mockFetchWith = response => {
  jest.spyOn(global, 'fetch').mockImplementation(response);
};
