import * as Actions from '../actions';
import { handleActions } from 'redux-actions';

export const reducer = handleActions(
  {
    [Actions.getKnownBoardsSuccess]: (state, action) => action.payload,
  },
  []
);

export const getKnownBoards = state => ({ boards: state });
