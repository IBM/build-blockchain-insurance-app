'use strict';

import * as PaymentActionType from './paymentActionTypes';

export function pay() {
  return {
    type: PaymentActionType.COMPLETE_PAYMENT,
    payed: true
  };
}
