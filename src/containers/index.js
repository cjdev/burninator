import React from 'react';
import PropTypes from 'prop-types';
import Loadable from 'react-loadable';

const LoadingComponent = ({ isLoading, error }) => {
  if (isLoading) return <div />;
  if (error) return <div>{error}</div>;
  return null;
};
LoadingComponent.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.any,
};

const makeLoadable = loader =>
  Loadable({
    loader,
    loading: LoadingComponent,
  });

export const AsyncBoard = makeLoadable(() => import('./Board'));
export const AsyncSynopsis = makeLoadable(() => import('./Synopsis'));
export const AsyncSnapshots = makeLoadable(() => import('./Snapshots'));
export const AsyncHome = makeLoadable(() => import('./Home'));
export const AsyncAbout = makeLoadable(() => import('./About'));
export const AsyncPlaninator = makeLoadable(() => import('./Planinator'));
export const AsyncComparinator = makeLoadable(() => import('./Comparinator'));
