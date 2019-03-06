import * as R from 'ramda';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { reducer as visualStackReducer } from '@cjdev/visual-stack-redux';

import burndownReducer from './reducer';
import * as Sagas from './sagas';

const configureStore = () => {
  const reducer = combineReducers({
    visualStack: visualStackReducer,
    burndown: burndownReducer,
  });

  // eslint-disable-next-line  no-underscore-dangle
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(reducer, {}, composeEnhancers(applyMiddleware(thunk, sagaMiddleware)));
  R.forEach(sagaMiddleware.run)(R.values(Sagas));
  return store;
};

export default configureStore;
