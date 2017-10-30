'use strict';

import fetch from 'isomorphic-fetch';

export function getBlocksFromShop(noOfLastBlocks) {
  return getBlocks('/shop/api/blocks', noOfLastBlocks);
}

export function getBlocksFromSelfService(noOfLastBlocks) {
  return getBlocks('/self-service/api/blocks', noOfLastBlocks);
}

export function getBlocksFromRepairShop(noOfLastBlocks) {
  return getBlocks('/repair-shop/api/blocks', noOfLastBlocks);
}

export function getBlocksFromContractManagement(noOfLastBlocks) {
  return getBlocks('/insurance/api/blocks', noOfLastBlocks);
}

function getBlocks(url, noOfLastBlocks) {
  return fetch(url, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ noOfLastBlocks })
  }).then(async res => {
    const blocks = await res.json();
    return blocks;
  });
}
