'use strict';

import * as InsuranceActionType from '../actions/insuranceActionTypes';
import * as initialState from './initialState';

export default function insuranceReducer(state = initialState.insurance, action) {
  switch (action.type) {
    case InsuranceActionType.LOAD_CONTRACT_TYPES_SUCCESS:
      return Object.assign({}, state, {
        contractTypes: [...action.contractTypes]
      });
    case InsuranceActionType.SUBMIT_CONTRACT:
      return Object.assign({}, state, {
        contractInfo: Object.assign({}, action.contractInfo)
      });
    default:
      return state;
  }
}
