'use strict';

import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/rootReducer';
import ReduxThunk from 'redux-thunk';

export default function configStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      ReduxThunk
    )
  );
}
