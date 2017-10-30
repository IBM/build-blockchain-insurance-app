'use strict';

import * as UserMgmtActionType from './userMgmtActionTypes';
import * as Api from '../api';

export function requestNewUser(user) {
  return async dispatch => {
    try {
      let responseUser = await Api.requestNewUser(user);
      dispatch(setUser(responseUser));
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
