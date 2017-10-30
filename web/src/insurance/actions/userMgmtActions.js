'use strict';

import * as UserMgmtActionType from './userMgmtActionTypes';
import * as Api from '../api';

export function authenticateUser(user) {
  return async dispatch => {
    try {
      let userAuthenticated = await Api.authenticateUser(user);
      if (userAuthenticated) {
        dispatch(setUser(user));
      } else {
        dispatch(setUser(false));
      }
    } catch (error) {
      console.log(error);
    }
  };
}

export function setUser(user) {
  return {
    type: UserMgmtActionType.SET_USER,
    user
  };
}
