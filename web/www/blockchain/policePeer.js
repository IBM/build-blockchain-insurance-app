'use strict';

import config from './config';
import { wrapError, marshalArgs } from './utils';
import { policeClient as client, isReady } from './setup';

import network from './invoke';


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
const peerType = 'insuranceUser'


async function invoke(fcn, ...args) {

  await network.invokeCC(fcn, ...args);

  console.log('after calling await network.invokeCC(fcn, ...args)')

  return client.invoke(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}

async function query(fcn, ...args) {

  console.log('after calling await network.queryCC(fcn, ...args)')

  return client.query(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);

}
