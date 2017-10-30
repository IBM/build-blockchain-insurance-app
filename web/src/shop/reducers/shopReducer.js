'use strict';

import * as ShopActionType from '../actions/shopActionTypes';
import * as initialState from './initialState';

export default function shopReducer(state = initialState.shop, action) {
  switch (action.type) {
    case ShopActionType.SET_SHOP_TYPE:
      return Object.assign({}, state,
        { type: action.shopType, products: [...action.products] });
    case ShopActionType.SUBMIT_PRODUCT:
      return Object.assign({}, state,
        { productInfo: action.productInfo });
    default:
      return state;
  }
}
