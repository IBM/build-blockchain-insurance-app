'use strict';

import fetch from 'isomorphic-fetch';

export function getClaims(status) {
  return fetch('/insurance/api/claims', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ status })
  }).then(async res => {
    const claims = await res.json();
    return claims;
  });
}

export function processClaim(contractUuid, uuid, status, reimbursable) {
  return fetch('/insurance/api/process-claim', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ contractUuid, uuid, status, reimbursable })
  }).then(async res => {
    return await res.json();
  });
}

export function getContractTypes() {
  return fetch('/insurance/api/contract-types', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(async res => {
    return await res.json();
  });
}

export function createContractType(contractType) {
  return fetch('/insurance/api/create-contract-type', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(contractType)
  }).then(async res => {
    const response = await res.json();
    if (response.success) {
      return response.uuid;
    } else {
      throw new Error(response.error);
    }
  });
}

export function setContractTypeActive(uuid, active) {
  return fetch('/insurance/api/set-contract-type-active', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ uuid, active })
  }).then(async res => {
    return await res.json();
  });
}

export function authenticateUser(user) {
  return fetch('/insurance/api/authenticate-user', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ user })
  }).then(async res => {
    let result = await res.json();
    if (result.error) {
      throw new Error("Invalid login!");
    } else {
      return result.success;
    }
  });
}

export function getContracts(user) {
  return fetch('/insurance/api/contracts', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ user })
  }).then(async res => {
    let result = await res.json();
    if (result.error) {
      throw new Error("Could not get contracts!");
    }
    return result.contracts;
  });
}

export function fileClaim(user, contractUuid, claim) {
  return fetch('/insurance/api/file-claim', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ user, contractUuid, claim })
  }).then(async res => {
    let result = await res.json();
    if (result.error) {
      throw new Error("Error occurred!");
    }
    return;
  });
}
