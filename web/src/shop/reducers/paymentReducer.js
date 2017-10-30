'use strict';

import * as PaymentActionType from '../actions/paymentActionTypes';
import * as initialState from './initialState';

export default function paymentReducer(state = initialState.payment, action) {
  switch (action.type) {
    case PaymentActionType.COMPLETE_PAYMENT:
      return Object.assign({}, state, { payed: action.payed });
    default:
      return state;
  }
}
