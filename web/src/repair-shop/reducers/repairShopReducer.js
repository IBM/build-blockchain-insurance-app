'use strict';

import * as RepairShopActionType from '../actions/repairShopActionTypes';
import * as initialState from './initialState';

export default function repairShopReducer(state = initialState.repairShop, action) {
  switch (action.type) {
    case RepairShopActionType.LOAD_REPAIR_ORDERS_SUCCESS:
      return Object.assign({}, state, { repairOrders: action.repairOrders });
    case RepairShopActionType.COMPLETE_REPAIR_ORDER_SUCCESS:
      return Object.assign({}, state,
        {
          repairOrders: [
            ...(state.repairOrders.filter(ro => ro.uuid !== action.uuid))
          ]
        });
    default:
      return state;
  }
}
