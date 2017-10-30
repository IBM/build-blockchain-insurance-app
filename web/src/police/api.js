'use strict';

import fetch from 'isomorphic-fetch';

export function listTheftClaims() {
  return fetch('/police/api/claims', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(async res => {
    const claims = await res.json();
    return claims;
  });
}

export function processTheftClaim(contractUuid, uuid, isTheft, fileReference) {
  return fetch('/police/api/process-claim', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({
      contractUuid, uuid, isTheft, fileReference
    })
  }).then(async res => {
    const response = await res.json();
    if (response.success) {
      return response.uuid;
    } else {
      throw new Error(response.error);
    }
  });
}
