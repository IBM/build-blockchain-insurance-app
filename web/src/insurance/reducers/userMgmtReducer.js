'use strict';

import * as UserMgmtActionType from '../actions/userMgmtActionTypes';
import * as initialState from './initialState';

export default function userMgmtReducer(state = initialState.userMgmt, action) {
  switch (action.type) {
    case UserMgmtActionType.SET_USER:
      return Object.assign({}, state, { user: action.user });
    default:
      return state;
  }
}
