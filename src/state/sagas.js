/* eslint-disable import/prefer-default-export */
import { call, takeEvery, put } from 'redux-saga/effects';
import {
  GET_BOARD,
  getBoardRequest,
  getBoardSuccess,
  getBoardFailure,
  GET_COMPARE_VERSIONS,
  getCompareVersionsRequest,
  getCompareVersionsSuccess,
  getCompareVersionsFailure,
  GET_KNOWN_BOARDS,
  getKnownBoardsRequest,
  getKnownBoardsSuccess,
  getKnownBoardsFailure,
  UPDATE_BOARD_VERSION,
  updateBoardVersionRequest,
  updateBoardVersionSuccess,
  updateBoardVersionFailure,
} from '../state/actions';
import * as Api from '../api';

// Board
function* fetchBoard(action) {
  try {
    yield put(getBoardRequest());
    const { boardId, version } = action.payload;
    const boardData = yield call(Api.fetchBoard, boardId, version);
    yield put(getBoardSuccess({ boardId: boardId, boardData }));
  } catch (e) {
    yield put(getBoardFailure(e.message));
  }
}

export function* boardSaga() {
  yield takeEvery(GET_BOARD, fetchBoard);
}

// Comparinator
//
function* fetchCompareVersions(action) {
  const { boardId, versions } = action.payload;
  try {
    yield put(getCompareVersionsRequest());
    const compareData = yield call(Api.fetchCompareVersions, boardId, versions);
    yield put(getCompareVersionsSuccess({ boardId, compareData }));
  } catch (e) {
    yield put(getCompareVersionsFailure(e.message));
  }
}

export function* compareSaga() {
  yield takeEvery(GET_COMPARE_VERSIONS, fetchCompareVersions);
}

// KnownBoards
//
function* fetchKnownBoards() {
  try {
    yield put(getKnownBoardsRequest());
    const knownBoardData = yield call(Api.fetchKnownBoards);
    yield put(getKnownBoardsSuccess(knownBoardData));
  } catch (e) {
    yield put(getKnownBoardsFailure(e.message));
  }
}

export function* knownBoardsSaga() {
  yield takeEvery(GET_KNOWN_BOARDS, fetchKnownBoards);
}

function* updateBoardVersion(action) {
  try {
    yield put(updateBoardVersionRequest());
    const boardData = yield call(Api.updateBoardVersion, action.payload);
    yield put(updateBoardVersionSuccess(boardData));
  } catch (e) {
    yield put(updateBoardVersionFailure(e));
  }
}

export function* updateBoardVersionSaga() {
  yield takeEvery(UPDATE_BOARD_VERSION, updateBoardVersion);
}
