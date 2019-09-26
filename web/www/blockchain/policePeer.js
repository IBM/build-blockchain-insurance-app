'use strict';

import config from './config';
import { wrapError, marshalArgs } from './utils';
import { policeClient as client, isReady } from './setup';

import network from './invoke';

import * as util from 'util' // has no default export

export async function listTheftClaims() {
  if (!isReady()) {
    return;
  }
  try {
    const theftClaims = await query('theft_claim_ls');
    return theftClaims;
  } catch (e) {
    throw wrapError(`Error getting theft claims ${e.message}`, e);
  }
}

export async function processTheftClaim(
  { uuid, contractUuid, isTheft, fileReference }) {
  if (!isReady()) {
    return;
  }
  try {
    await invoke('theft_claim_process',
      { uuid, contractUuid, isTheft, fileReference });
  } catch (e) {
    throw wrapError(`Error processing theft claim ${e.message}`, e);
  }
}

export const on = client.on.bind(client);
export const once = client.once.bind(client);
export const addListener = client.addListener.bind(client);
export const prependListener = client.prependListener.bind(client);
export const removeListener = client.removeListener.bind(client);

//identity to use for submitting transactions to smart contract
const peerType = 'policeApp-admin'
let isQuery = false;

async function invoke(fcn, ...args) {
  
  isQuery = false;

  console.log(`args in policePeer invoke: ${util.inspect(...args)}`)
  console.log(`func in policePeer invoke: ${util.inspect(fcn)}`)

  if (config.isCloud) {
    await network.invokeCC(isQuery, peerType, fcn, ...args);
  }

  return client.invoke(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}

async function query(fcn, ...args) {

  isQuery = true; 
  
  console.log(`args in policePeer query: ${util.inspect(...args)}`)
  console.log(`func in policePeer query: ${util.inspect(fcn)}`)

  if (config.isCloud) {
    await network.invokeCC(isQuery, peerType, fcn, ...args);
  }

  return client.query(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);

}
