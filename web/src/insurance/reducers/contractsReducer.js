'use strict';

import * as ContractsActionTypes from '../actions/contractsActionTypes';
import * as initialState from './initialState';

export default function insuranceReducer(state = initialState.contracts, action) {
  switch (action.type) {
    case ContractsActionTypes.LOAD_CONTRACTS_SUCCESS:
      return [...action.contracts];
    default:
      return state;
  }
}
