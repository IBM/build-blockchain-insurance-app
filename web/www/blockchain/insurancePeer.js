'use strict';

import config from './config';
import { wrapError, marshalArgs } from './utils';
import { insuranceClient as client, isReady } from './setup';
import uuidV4 from 'uuid/v4';

import network from './invoke';

import * as util from 'util' // has no default export

export async function getContractTypes() {
  if (!isReady()) {
    return;
  }
  try {
    const contractTypes = await query('contract_type_ls');
    return contractTypes;
  } catch (e) {
    throw wrapError(`Error getting contract types: ${e.message}`, e);
  }
}

export async function createContractType(contractType) {
  if (!isReady()) {
    return;
  }
  try {
    let ct = contractType.uuid ? contractType :
      Object.assign({ uuid: uuidV4() }, contractType);
    const successResult = await invoke('contract_type_create', ct);
    if (successResult) {
      throw new Error(successResult);
    }
    return ct.uuid;
  } catch (e) {
    throw wrapError(`Error creating contract type: ${e.message}`, e);
  }
}

export async function setActiveContractType(uuid, active) {
  if (!isReady()) {
    return;
  }
  try {
    const successResult = await invoke('contract_type_set_active',
      { uuid, active });
    if (successResult) {
      throw new Error(successResult);
    }
    return successResult;
  } catch (e) {
    throw wrapError(`Error setting active contract type: ${e.message}`, e);
  }
}

export async function getContracts(username) {
  if (!isReady()) {
    return;
  }
  try {
    if (typeof username !== 'string') {
      username = undefined;
    }
    const contracts = await query('contract_ls', { username });
    return contracts;
  } catch (e) {
    let errMessage;
    if (username) {
      errMessage = `Error getting contracts for user ${username}: ${e.message}`;
    } else {
      errMessage = `Error getting all contracts: ${e.message}`;
    }
    throw wrapError(errMessage, e);
  }
}

export async function getClaims(status) {
  if (!isReady()) {
    return;
  }
  try {
    if (typeof status !== 'string') {
      status = undefined;
    }
    const claims = await query('claim_ls', { status });
    return claims;
  } catch (e) {
    let errMessage;
    if (status) {
      errMessage = `Error getting claims with status ${status}: ${e.message}`;
    } else {
      errMessage = `Error getting all claims: ${e.message}`;
    }
    throw wrapError(errMessage, e);
  }
}

export async function fileClaim(claim) {
  if (!isReady()) {
    return;
  }
  try {
    console.log(`claim: ${util.inspect(claim)}`)

    const c = Object.assign({}, claim, { uuid: uuidV4() });

    console.log(`after assigning uuid in fileClaim, c: ${util.inspect(c)}`)

    const successResult = await invoke('claim_file', c);
    console.log(`successResult, after calling invoke claim_file from insurancePeer.js ${util.inspect(successResult)}`)
    if (successResult) {
      throw new Error(successResult);
    }
    return c.uuid;
  } catch (e) {
    throw wrapError(`Error filing a new claim: ${e.message}`, e);
  }
}

export async function processClaim(contractUuid, uuid, status, reimbursable) {
  if (!isReady()) {
    return;
  }
  try {
    const successResult = await invoke('claim_process', { contractUuid, uuid, status, reimbursable });
    if (successResult) {
      throw new Error(successResult);
    }
    return successResult;
  } catch (e) {
    throw wrapError(`Error processing claim: ${e.message}`, e);
  }
}

export async function authenticateUser(username, password) {
  if (!isReady()) {
    return;
  }
  try {
    let authenticated = await query('user_authenticate', { username, password });
    if (authenticated === undefined || authenticated === null) {
      throw new Error('Unknown error, invalid response!');
    }
    return authenticated;
  } catch (e) {
    throw wrapError(`Error authenticating user: ${e.message}`, e);
  }
}

export async function getUserInfo(username) {
  if (!isReady()) {
    return;
  }
  try {
    const user = await query('user_get_info', { username });
    return user;
  } catch (e) {
    throw wrapError(`Error getting user info: ${e.message}`, e);
  }
}

export function getBlocks(noOfLastBlocks) {
  return client.getBlocks(noOfLastBlocks);
}

export const on = client.on.bind(client);
export const once = client.once.bind(client);
export const addListener = client.addListener.bind(client);
export const prependListener = client.prependListener.bind(client);
export const removeListener = client.removeListener.bind(client);

//identity to use for submitting transactions to smart contract
const peerType = 'insuranceApp-admin'
let isQuery = false;

async function invoke(fcn, ...args) {

  isQuery = false;

  console.log(`args in insurancePeer invoke: ${util.inspect(...args)}`)
  console.log(`func in insurancePeer invoke: ${util.inspect(fcn)}`)

  if (config.isCloud) {
    await network.invokeCC(isQuery, peerType, fcn, ...args);
  }
  
  return client.invoke(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}

async function query(fcn, ...args) {

  isQuery = true;
  console.log(`args in insurancePeer query: ${util.inspect(...args)}`)
  console.log(`func in insurancePeer query: ${util.inspect(fcn)}`)

  if (config.isCloud) {
    await network.invokeCC(isQuery, peerType, fcn, ...args);
  }

  return client.query(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}
