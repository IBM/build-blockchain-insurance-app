'use strict';

import * as ContractTemplateActionType from './contractTemplateActionTypes';
import * as Api from '../api';

export function loadContractTypes() {
  return async dispatch => {
    let contractTypes;
    try {
      contractTypes = await Api.getContractTypes();
    } catch (e) {
      console.log(e);
    }
    if (Array.isArray(contractTypes)) {
      dispatch(loadContractTypesSuccess(contractTypes));
    }
  };
}

function loadContractTypesSuccess(contractTypes) {
  return {
    type: ContractTemplateActionType.LOAD_CONTRACT_TYPES_SUCCESS,
    contractTypes
  };
}

export function createContractType(contractType) {
  return async dispatch => {
    try {
      const uuid = await Api.createContractType(contractType);
      if (uuid) {
        const newContractType = Object.assign({}, contractType, { uuid });
        dispatch(createContractTypeSuccess(newContractType));
      }
    } catch (e) {
      console.log(e);
    }
  };
}

function createContractTypeSuccess(contractType) {
  return {
    type: ContractTemplateActionType.CREATE_CONTRACT_TYPE_SUCCESS,
    contractType
  };
}

export function setContractTypeActive(uuid, active) {
  return async dispatch => {
    try {
      await Api.setContractTypeActive(uuid, active);
      dispatch(setContractTypeActiveSuccess(uuid, active));
    } catch (e) {
      console.log(e);
    }
  };
}

function setContractTypeActiveSuccess(uuid, active) {
  return {
    type: ContractTemplateActionType.SET_CONTRACT_TYPE_ACTIVE_SUCCESS,
    uuid, active
  };
}
