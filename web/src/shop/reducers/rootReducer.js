'use strict';

import { combineReducers } from 'redux';

import shop from './shopReducer';
import insurance from './insuranceReducer';
import payment from './paymentReducer';
import userMgmt from './userMgmtReducer';

export default combineReducers({ shop, insurance, payment, userMgmt });
