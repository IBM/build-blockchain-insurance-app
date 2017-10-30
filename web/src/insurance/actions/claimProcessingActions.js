'use strict';

import * as ClaimProcessingActionType from './claimProcessingActionTypes';
import * as Api from '../api';

export function loadClaims() {
  return async dispatch => {
    let claims;
    try {
      claims = await Api.getClaims('N'); // Load only (N)ew (unprocessed) claims
      const confirmedTheftClaims = await Api.getClaims('P');
      claims = claims.concat(confirmedTheftClaims);
    } catch (e) {
      console.log(e);
    }
    if (Array.isArray(claims)) {
      dispatch(loadClaimsSuccess(claims));
    }
  };
}

function loadClaimsSuccess(claims) {
  return {
    type: ClaimProcessingActionType.LOAD_CLAIMS_SUCCESS,
    claims
  };
}

export function processClaim(contractUuid, uuid, status, reimbursable) {
  return async dispatch => {
    try {
      await Api.processClaim(contractUuid, uuid, status, reimbursable);
      dispatch(processClaimSuccess(contractUuid, uuid));
    } catch (e) {
      console.log(e);
    }
  };
}

function processClaimSuccess(contractUuid, uuid) {
  return {
    type: ClaimProcessingActionType.PROCESS_CLAIM_SUCCESS,
    contractUuid, uuid
  };
}
