'use strict';

import * as ShopActionType from './shopActionTypes';

export function setShopType(shopType, products) {
  return {
    type: ShopActionType.SET_SHOP_TYPE,
    shopType,
    products
  };
}

export function submitProduct(productInfo) {
  return {
    type: ShopActionType.SUBMIT_PRODUCT,
    productInfo
  };
}
