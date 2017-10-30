'use strict';

import * as InsuranceActionType from './insuranceActionTypes';
import * as Api from '../api';

export function loadContractsTypes(shopType) {
  return async dispatch => {
    let contractTypes;
    try {
      contractTypes = await Api.getContractTypes(shopType);
    } catch (error) {
      console.log(error); // Just logging the error nothing more.
    }
    if (contractTypes) {
      dispatch(loadContractsTypesSuccess(contractTypes));
    }
  };
}

function loadContractsTypesSuccess(contractTypes) {
  return {
    type: InsuranceActionType.LOAD_CONTRACT_TYPES_SUCCESS,
    contractTypes
  };
}

export function submitContract(contractInfo) {
  return {
    type: InsuranceActionType.SUBMIT_CONTRACT,
    contractInfo
  };
}
