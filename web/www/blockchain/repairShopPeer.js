'use strict';

import config from './config';
import { wrapError } from './utils';
import { repairShopClient as client, isReady } from './setup';

import network from './invoke';

import * as util from 'util' // has no default export

export async function getRepairOrders() {
  if (!isReady()) {
    return;
  }
  try {
    const repairOrders = await query('repair_order_ls');
    return repairOrders;
  } catch (e) {
    throw wrapError(`Error getting repair orders: ${e.message}`, e);
  }
}

export async function completeRepairOrder(uuid) {
  if (!isReady()) {
    return;
  }
  try {
    const successResult = await invoke(`repair_order_complete`, { uuid });
    if (successResult) {
      throw new Error(successResult);
    }
  } catch (e) {
    throw wrapError(`Error marking repair order as complete: ${e.message}`, e);
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
const peerType = 'repairShopApp-admin'
let isQuery = false;

async function invoke(fcn, ...args) {

  isQuery = false;

  console.log(`args in repairPeer invoke: ${util.inspect(...args)}`)
  console.log(`func in repairPeer invoke: ${util.inspect(fcn)}`)

  if (config.isCloud) {
    await network.invokeCC(isQuery, peerType, fcn, ...args);
  }

  return client.invoke(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}

async function query(fcn, ...args) {

  isQuery = true; 

  console.log(`args in repairPeer query: ${util.inspect(...args)}`)
  console.log(`func in repairPeer query: ${util.inspect(fcn)}`)

  if (config.isCloud) {
    await network.invokeCC(isQuery, peerType, fcn, ...args);
  }

  return client.query(
    config.chaincodeId, config.chaincodeVersion, fcn, ...args);
}
