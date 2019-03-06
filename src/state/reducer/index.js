import { combineReducers } from 'redux';
import * as fromKnownBoards from './knownBoards';
import * as fromComparinator from './comparinator';
import * as fromCurrentBoard from './currentBoard';

export const getCurrentBoard = state =>
  fromCurrentBoard.getCurrentBoard(state.burndown.currentBoard);

export const getSyncState = state => fromCurrentBoard.getSyncState(state.burndown.currentBoard);

export const getComparinator = state =>
  fromComparinator.getComparinator(state.burndown.comparinator);

export const getKnownBoards = state => fromKnownBoards.getKnownBoards(state.burndown.knownBoards);

export default combineReducers({
  currentBoard: fromCurrentBoard.reducer,
  knownBoards: fromKnownBoards.reducer,
  comparinator: fromComparinator.reducer,
});
