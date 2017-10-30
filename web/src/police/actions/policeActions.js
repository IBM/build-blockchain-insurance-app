'use strict';

import * as PoliceShopActionType from './policeActionTypes';
import * as Api from '../api';

export function loadTheftClaims() {
  return async dispatch => {
    let theftClaims;
    try {
      theftClaims = await Api.listTheftClaims();
    } catch (e) {
      console.log(e);
    }
    if (Array.isArray(theftClaims)) {
      dispatch(loadTheftClaimsSuccess(theftClaims));
    }
  };
}

function loadTheftClaimsSuccess(theftClaims) {
  return {
    type: PoliceShopActionType.LOAD_THEFT_CLAIMS_SUCCESS,
    theftClaims
  };
}

export function processTheftClaim(
  { contractUuid, uuid, isTheft, fileReference }) {
  return async dispatch => {
    try {
      await Api.processTheftClaim(contractUuid, uuid, isTheft, fileReference);
      dispatch(processTheftClaimSuccess(uuid));
    } catch (e) {
      console.log(e);
    }
  };
}

function processTheftClaimSuccess(uuid) {
  return {
    type: PoliceShopActionType.PROCESS_THEFT_CLAIM_SUCCESS,
    uuid
  };
}
