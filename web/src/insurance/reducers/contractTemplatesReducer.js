'use strict';

import * as ContractTemplateActionType from '../actions/contractTemplateActionTypes';
import * as initialState from './initialState';

export default function contractTemplateReducer(state = initialState.contractTemplates, action) {
  switch (action.type) {
    case ContractTemplateActionType.LOAD_CONTRACT_TYPES_SUCCESS:
      return Object.assign({}, state, {
        contractTypes: [...action.contractTypes]
      });
    case ContractTemplateActionType.CREATE_CONTRACT_TYPE_SUCCESS:
      return Object.assign({}, state, {
        contractTypes: [...state.contractTypes, action.contractType]
      });
    case ContractTemplateActionType.SET_CONTRACT_TYPE_ACTIVE_SUCCESS:
      {
        let contractTypesWithout = state.contractTypes.filter(ct => ct.uuid !== action.uuid);
        let newContractType = state.contractTypes.find(ct => ct.uuid === action.uuid);
        return Object.assign({}, state, {
          contractTypes: [
            ...contractTypesWithout,
            Object.assign({}, newContractType, { active: action.active })
          ]
        });
      }
    default:
      return state;
  }
}
