import axios from 'axios';
import { createActions, createAction } from 'redux-actions';
import * as Api from '../api';
/*
Naming pattern for redux actions
== GET ==
GET_<ENTITY>           // (optional) saga signal
GET_<ENTITY>_REQUEST   // initial server interaction
GET_<ENTTIY>_SUCCESS   // successfully complete server interaction
GET_<ENTITY>_FAILURE   // unsuccessfully complete server interaction

== PUT ==
PUT_<ENTITY>           // (optional) saga signal
PUT_<ENTITY>_REQUEST   // initial server interaction
PUT_<ENTTIY>_SUCCESS   // successfully complete server interaction
PUT_<ENTITY>_FAILURE   // unsuccessfully complete server interaction
*/

// ========================================================
// UrlOptions
export const SET_URL_OPTIONS = 'SET_URL_OPTIONS';
export const setUrlOptions = createAction(SET_URL_OPTIONS);

// ========================================================
// toggleException
export const TOGGLE_ISSUE_EXCEPTION = 'TOGGLE_ISSUE_EXCEPTION';
export const toggleIssueException = createAction(TOGGLE_ISSUE_EXCEPTION);

// ========================================================
// Board
export const GET_BOARD = 'GET_BOARD';
export const GET_BOARD_REQUEST = 'GET_BOARD_REQUEST';
export const GET_BOARD_SUCCESS = 'GET_BOARD_SUCCESS';
export const GET_BOARD_FAILURE = 'GET_BOARD_FAILURE';
export const { getBoard, getBoardRequest, getBoardSuccess, getBoardFailure } = createActions(
  GET_BOARD,
  GET_BOARD_REQUEST,
  GET_BOARD_SUCCESS,
  GET_BOARD_FAILURE
);

// ========================================================
// KNOWN BOARDS
export const GET_KNOWN_BOARDS = 'GET_KNOWN_BOARDS';
export const GET_KNOWN_BOARDS_REQUEST = 'GET_KNOWN_BOARDS_REQUEST';
export const GET_KNOWN_BOARDS_SUCCESS = 'GET_KNOWN_BOARDS_SUCCESS';
export const GET_KNOWN_BOARDS_FAILURE = 'GET_KNOWN_BOARDS_FAILURE';

export const {
  getKnownBoards,
  getKnownBoardsRequest,
  getKnownBoardsSuccess,
  getKnownBoardsFailure,
} = createActions(
  GET_KNOWN_BOARDS,
  GET_KNOWN_BOARDS_REQUEST,
  GET_KNOWN_BOARDS_SUCCESS,
  GET_KNOWN_BOARDS_FAILURE
);

// ========================================================
// COMPARINATOR
//
export const GET_COMPARE_VERSIONS = 'GET_COMPARE_VERSIONS';
export const GET_COMPARE_VERSIONS_REQUEST = 'GET_COMPARE_VERSIONS_REQUEST';
export const GET_COMPARE_VERSIONS_SUCCESS = 'GET_COMPARE_VERSIONS_SUCCESS';
export const GET_COMPARE_VERSIONS_FAILURE = 'GET_COMPARE_VERSIONS_FAILURE';
export const {
  getCompareVersions,
  getCompareVersionsRequest,
  getCompareVersionsSuccess,
  getCompareVersionsFailure,
} = createActions(
  GET_COMPARE_VERSIONS,
  GET_COMPARE_VERSIONS_REQUEST,
  GET_COMPARE_VERSIONS_SUCCESS,
  GET_COMPARE_VERSIONS_FAILURE
);

// ======================================================

export const UPDATE_ACTIVE_CHART_INDEX = 'UPDATE_ACTIVE_CHART_INDEX';
export const updateActiveChartIndex = createAction(UPDATE_ACTIVE_CHART_INDEX);

// ======================================================
//
export const UPDATE_CONFIGURATION_REQUEST = 'UPDATE_CONFIGURATION_REQUEST';
export const UPDATE_CONFIGURATION_SUCCESS = 'UPDATE_CONFIGURATION_SUCCESS';
export const UPDATE_CONFIGURATION_FAILURE = 'UPDATE_CONFIGURATION_FAILURE';
export const {
  updateConfigurationRequest,
  updateConfigurationSuccess,
  updateConfigurationFailure,
} = createActions(
  UPDATE_CONFIGURATION_REQUEST,
  UPDATE_CONFIGURATION_SUCCESS,
  UPDATE_CONFIGURATION_FAILURE
);

export function updateConfiguration(boardId, config) {
  return dispatch => {
    dispatch(updateConfigurationRequest());
    return fetch(`/api/board/${boardId}/configuration`, {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: {
        'content-type': 'application/json',
      },
    })
      .then(res => {
        dispatch(updateConfigurationSuccess());
        dispatch(fetchConfigVersion(boardId, 'current'));
        dispatch(getBoard({ boardId, version: 'current' }));
      })
      .catch(error => dispatch(updateConfigurationFailure(error)));
  };
}

// ======================================================
//

export const RECEIVE_CONFIG_VERSION = 'RECEIVE_CONFIG_VERSION';
export const FAILURE_CONFIG_VERSION = 'FAILURE_CONFIG_VERSION';

export function fetchConfigVersion(boardId, version) {
  return dispatch => {
    return axios
      .get(`/api/board/${boardId}/configuration/${version}`)
      .then(res =>
        dispatch({
          type: RECEIVE_CONFIG_VERSION,
          config: res.data,
        })
      )
      .catch(err => {
        if (err.response.status === 404) {
          return dispatch({
            type: RECEIVE_CONFIG_VERSION,
            config: {},
          });
        } else {
          return dispatch({
            type: FAILURE_CONFIG_VERSION,
            error: err,
          });
        }
      });
  };
}
// ======================================================
//

export const GET_CONFIG_VERSIONS_SUCCESS = 'GET_CONFIG_VERSIONS_SUCCESS';
export const GET_CONFIG_VERSIONS_FAILURE = 'GET_CONFIG_VERSIONS_FAILURE';
export const { getConfigVersionsSuccess, getConfigVersionsFailure } = createActions(
  GET_CONFIG_VERSIONS_SUCCESS,
  GET_CONFIG_VERSIONS_FAILURE
);

export function fetchConfigVersions(boardId) {
  return dispatch => {
    return axios
      .get(`/api/board/${boardId}/configuration/history`)
      .then(res => dispatch(getConfigVersionsSuccess(res.data)))
      .catch(err => dispatch(getConfigVersionsFailure()));
  };
}
// ======================================================
//
export const GET_BOARD_VERSIONS_REQUEST = 'GET_BOARD_VERSIONS_REQUEST';
export const GET_BOARD_VERSIONS_SUCCESS = 'GET_BOARD_VERSIONS_SUCCESS';
export const GET_BOARD_VERSIONS_FAILURE = 'GET_BOARD_VERSIONS_FAILURE';
export const {
  getBoardVersionsRequest,
  getBoardVersionsSuccess,
  getBoardVersionsFailure,
} = createActions(
  GET_BOARD_VERSIONS_REQUEST,
  GET_BOARD_VERSIONS_SUCCESS,
  GET_BOARD_VERSIONS_FAILURE
);

export function getBoardVersions(boardId) {
  return dispatch => {
    dispatch(getBoardVersionsRequest());
    return axios
      .get(`/api/board/${boardId}/history`)
      .then(res => dispatch(getBoardVersionsSuccess({ boardId, versions: res.data })))
      .catch(err => dispatch(getBoardVersionsFailure(err)));
  };
}

// ======================================================
// SYNC
export const GET_SYNC_BOARD_REQUEST = 'GET_SYNC_BOARD_REQUEST';
export const GET_SYNC_BOARD_UPDATE = 'GET_SYNC_BOARD_UPDATE';
export const GET_SYNC_BOARD_SUCCESS = 'GET_SYNC_BOARD_SUCCESS';
export const GET_SYNC_BOARD_FAILURE = 'GET_SYNC_BOARD_FAILURE';

export const getSyncBoard = ({ boardId }) => {
  return async dispatch => {
    try {
      dispatch(getSyncBoardRequest());
      const boardData = await Api.syncBoard({ boardId }, data => {
        dispatch(getSyncBoardUpdate(data));
      });
      dispatch(getSyncBoardSuccess(boardData));
      dispatch(getBoardSuccess({ boardId, boardData }));
    } catch (err) {
      dispatch(getSyncBoardFailure({ message: err }));
    }
  };
};

export const {
  getSyncBoardRequest,
  getSyncBoardUpdate,
  getSyncBoardSuccess,
  getSyncBoardFailure,
} = createActions(
  GET_SYNC_BOARD_REQUEST,
  GET_SYNC_BOARD_UPDATE,
  GET_SYNC_BOARD_SUCCESS,
  GET_SYNC_BOARD_FAILURE
);

// ========================================================
// RESET
export const GET_RESET_BOARD_REQUEST = 'GET_RESET_BOARD_REQUEST';
export const GET_RESET_BOARD_UPDATE = 'GET_RESET_BOARD_UPDATE';

export const GET_RESET_BOARD_SUCCESS = 'GET_RESET_BOARD_SUCCESS';
export const GET_RESET_BOARD_FAILURE = 'GET_RESET_BOARD_FAILURE';
export const {
  getResetBoardRequest,
  getResetBoardUpdate,
  getResetBoardSuccess,
  getResetBoardFailure,
} = createActions(
  GET_RESET_BOARD_REQUEST,
  GET_RESET_BOARD_UPDATE,
  GET_RESET_BOARD_SUCCESS,
  GET_RESET_BOARD_FAILURE
);

export const getResetBoard = ({ boardId }) => {
  return async dispatch => {
    try {
      dispatch(getResetBoardRequest());
      const boardData = await Api.resetBoard({ boardId }, data => {
        dispatch(getResetBoardUpdate(data));
      });
      dispatch(getResetBoardSuccess(boardData));
      dispatch(getBoardSuccess({ boardId, boardData }));
    } catch (err) {
      dispatch(getResetBoardFailure({ message: err }));
    }
  };
};

// ========================================================
// UPDATE_BOARD_VERSION
export const UPDATE_BOARD_VERSION = 'UPDATE_BOARD_VERSION';
export const UPDATE_BOARD_VERSION_REQUEST = 'UPDATE_BOARD_VERSION_REQUEST';
export const UPDATE_BOARD_VERSION_SUCCESS = 'UPDATE_BOARD_VERSION_SUCCESS';
export const UPDATE_BOARD_VERSION_FAILURE = 'UPDATE_BOARD_VERSION_FAILURE';

export const {
  updateBoardVersion,
  updateBoardVersionRequest,
  updateBoardVersionSuccess,
  updateBoardVersionFailure,
} = createActions(
  UPDATE_BOARD_VERSION,
  UPDATE_BOARD_VERSION_REQUEST,
  UPDATE_BOARD_VERSION_SUCCESS,
  UPDATE_BOARD_VERSION_FAILURE
);
