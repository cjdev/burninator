import * as R from 'ramda';
import { combineReducers } from 'redux';
import { combineActions, handleActions } from 'redux-actions';
import * as Actions from '../actions';
import { parseQuery } from '../../utils';
import Board from '../../domain/Board';
import { mapIndex } from '../../utils';

const logUpdate = u => console.log(`[${u.message}]: ${u.elapsed} ms`);

const summarizeUpdates = updates => {
  R.pipe(
    mapIndex((update, i) => {
      const prevUpdate = R.prop(i - 1)(updates);
      const elapsed = prevUpdate ? update.ts - prevUpdate.ts : 0;

      return {
        message: update.message,
        elapsed,
      };
    }),
    R.forEach(logUpdate)
  )(updates);
  const firstUpdateTs = R.head(updates).ts;
  const lastUpdateTs = R.last(updates).ts;
  logUpdate({ message: 'total time', elapsed: lastUpdateTs - firstUpdateTs });
};

const syncState = handleActions(
  {
    [combineActions(Actions.GET_RESET_BOARD_REQUEST, Actions.GET_SYNC_BOARD_REQUEST)]: state => ({
      ...state,
      isSyncing: true,
      syncError: null,
      syncUpdates: [],
      syncStartTime: Date.now(),
    }),
    [combineActions(Actions.GET_SYNC_BOARD_UPDATE, Actions.GET_RESET_BOARD_UPDATE)]: (
      state,
      action
    ) => ({
      ...state,
      syncUpdates: [...state.syncUpdates, action.payload],
    }),
    [combineActions(Actions.GET_RESET_BOARD_SUCCESS, Actions.GET_SYNC_BOARD_SUCCESS)]: (
      state,
      action
    ) => {
      summarizeUpdates(state.syncUpdates, action);
      return {
        ...state,
        isSyncing: false,
        syncError: null,
      };
    },
    [combineActions(Actions.GET_RESET_BOARD_FAILURE, Actions.GET_SYNC_BOARD_FAILURE)]: (
      state,
      action
    ) => ({
      ...state,
      isSyncing: false,
      syncError: action.payload.message,
    }),
  },
  {
    isSyncing: false,
    syncError: null,
    syncUpdates: [],
    syncStartTime: null,
  }
);

const boardDataInitialState = {
  isLoaded: false,
  isSyncing: false,
  startDate: null,
  releaseBlocks: [],
  iterationStats: [],
  issueExceptions: [],
  boardVersions: {
    loading: false,
    error: null,
    data: null,
  },
  boardVersionUpdate: {
    loading: false,
    error: null,
  },
  opts: {},
  configuration: {
    loading: false,
    error: null,
  },
};

const boardData = handleActions(
  {
    [Actions.UPDATE_ACTIVE_CHART_INDEX]: (state, { payload }) => ({
      ...state,
      activeChartIndex: payload,
    }),
    [Actions.SET_URL_OPTIONS]: (state, { payload }) => ({
      ...state,
      urlOptions: parseQuery(payload),
    }),
    [Actions.TOGGLE_ISSUE_EXCEPTION]: (state, { payload: key }) => {
      const existingIssueExceptions = state.issueExceptions;
      const issueExceptions = R.contains(key, existingIssueExceptions)
        ? R.without([key], existingIssueExceptions)
        : R.concat([key], existingIssueExceptions);
      return {
        ...state,
        issueExceptions,
        processed: new Board(
          state.processed.boardId,
          state.processed.serverBoardData,
          state.urlOptions,
          issueExceptions
        ),
      };
    },
    [Actions.GET_BOARD_REQUEST]: state => ({
      ...state,
      isLoaded: false,
    }),
    [Actions.GET_BOARD_SUCCESS]: (state, { payload }) => ({
      ...state,
      isLoaded: true,
      issueExceptions: [],
      processed: new Board(payload.boardId, payload.boardData, state.urlOptions),
    }),
    [Actions.GET_BOARD_FAILURE]: (state, { payload }) => ({
      ...state,
      isLoaded: true,
      issueExceptions: [],
      processed: { error: payload },
    }),
    [Actions.GET_CONFIG_VERSIONS_SUCCESS]: (state, { payload }) => ({
      ...state,
      configVersions: payload,
    }),
    [Actions.GET_CONFIG_VERSIONS_FAILURE]: state => ({
      ...state,
      configVersions: null,
    }),
    [Actions.RECEIVE_CONFIG_VERSION]: (state, { payload }) => ({
      ...state,
      config: payload,
    }),
    [Actions.GET_BOARD_VERSIONS_REQUEST]: state => ({
      ...state,
      boardVersions: {
        loading: true,
        error: null,
        data: null,
      },
    }),
    [Actions.GET_BOARD_VERSIONS_SUCCESS]: (state, { payload }) => ({
      ...state,
      boardVersions: {
        loading: false,
        error: null,
        data: payload.versions,
      },
    }),
    [Actions.GET_BOARD_VERSIONS_FAILURE]: (state, { payload }) => ({
      ...state,
      boardVersions: {
        loading: false,
        error: payload.error,
        data: null,
      },
    }),
    [Actions.UPDATE_CONFIGURATION_REQUEST]: state => ({
      ...state,
      configuration: {
        loading: true,
        error: null,
      },
    }),
    [Actions.UPDATE_CONFIGURATION_SUCCESS]: state => ({
      ...state,
      configuration: {
        loading: false,
      },
    }),
    [Actions.UPDATE_CONFIGURATION_FAILURE]: (state, { payload }) => ({
      ...state,
      configuration: {
        loadin: false,
        error: payload,
      },
    }),
    [Actions.UPDATE_BOARD_VERSION_REQUEST]: state => ({
      ...state,
      boardVersionUpdate: {
        loading: true,
        error: null,
      },
    }),
    [Actions.UPDATE_BOARD_VERSION_SUCCESS]: state => ({
      ...state,
      boardVersionUpdate: {
        loading: false,
        error: null,
      },
    }),
    [Actions.UPDATE_BOARD_VERSION_FAILURE]: (state, { payload }) => ({
      ...state,
      boardVersionUpdate: {
        loading: false,
        error: payload,
      },
    }),
  },
  boardDataInitialState
);

export const getCurrentBoard = state => state.boardData;
export const getSyncState = state => state.syncState;

export const reducer = combineReducers({
  boardData,
  syncState,
});
