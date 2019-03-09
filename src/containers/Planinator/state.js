import { createAction, handleActions } from 'redux-actions';

export const actions = {
  getPlanStart: createAction('@burninator/planinator/getPlanStart'),
  getPlanSuccess: createAction('@burninator/planinator/getPlanSuccess'),
  getPlanError: createAction('@burninator/planinator/getPlanError'),

  putPlanStart: createAction('@burninator/planinator/putPlanStart'),
  putPlanSuccess: createAction('@burninator/planinator/putPlanSuccess'),
  putPlanError: createAction('@burninator/planinator/putPlanError'),
};

const handleGetPlanStart = (state, action) => {
  return {
    ...state,
    apiMeta: {
      error: null,
      loading: true,
    },
  };
};

const handleGetPlanSuccess = (state, { payload }) => {
  return {
    ...state,
    apiMeta: {
      error: null,
      loading: false,
    },
    settings: payload.settings,
    tracks: payload.tracks,
  };
};

const handleGetPlanError = (state, { payload }) => {
  return {
    ...state,
    apiMeta: {
      error: payload,
      loading: false,
    },
  };
};

const handlePutPlanStart = (state, action) => {
  console.log('handlePutPlanStart');
  return {
    ...state,
    putApiMeta: {
      error: null,
      loading: true,
    },
  };
};

const handlePutPlanSuccess = (state, action) => {
  console.log('handlePutPlanSuccess');
  return {
    ...state,
    putApiMeta: {
      error: null,
      loading: false,
    },
  };
};

const handlePutPlanError = (state, { payload }) => {
  console.log('handlePutPlanError');
  return {
    ...state,
    putApiMeta: {
      error: payload,
      loading: false,
    },
  };
};

export const initialState = {
  settings: {},
  tracks: [],
  apiMeta: {
    error: null,
    loading: false,
  },
  putApiMeta: {
    error: null,
    loading: false,
  },
};

export const reducer = handleActions(
  {
    [actions.getPlanStart]: handleGetPlanStart,
    [actions.getPlanSuccess]: handleGetPlanSuccess,
    [actions.getPlanError]: handleGetPlanError,
    [actions.putPlanStart]: handlePutPlanStart,
    [actions.putPlanSuccess]: handlePutPlanSuccess,
    [actions.putPlanError]: handlePutPlanError,
  },
  initialState
);
