'use strict';

import * as ContractsActionTypes from './contractsActionTypes';
import * as Api from '../api';

export function loadContracts(user) {
  return async dispatch => {
    let contracts;
    try {
      contracts = await Api.getContracts(user);
    } catch (error) {
      console.log(error); // Just logging the error nothing more.
    }
    if (contracts) {
      dispatch(loadContractsSuccess(contracts));
    }
  };
}

function loadContractsSuccess(contracts) {
  return {
    type: ContractsActionTypes.LOAD_CONTRACTS_SUCCESS,
    contracts
  };
}
