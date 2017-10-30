'use strict';

import * as PoliceActionType from '../actions/policeActionTypes';
import * as initialState from './initialState';

export default function policeReducer(state = initialState.police, action) {
  switch (action.type) {
    case PoliceActionType.LOAD_THEFT_CLAIMS_SUCCESS:
      return Object.assign({}, state, { theftClaims: action.theftClaims });
    case PoliceActionType.PROCESS_THEFT_CLAIM_SUCCESS:
      return Object.assign({}, state,
        {
          theftClaims: [
            ...(state.theftClaims.filter(tc => tc.uuid !== action.uuid))
          ]
        });
    default:
      return state;
  }
}
