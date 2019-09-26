'use strict';

import {
  resolve
} from 'path';
import EventEmitter from 'events';

import config from './config';

import {
  load as loadProto
} from 'grpc';
import Long from 'long';
import hfc from 'fabric-client';
import utils from 'fabric-client/lib/utils';
import Orderer from 'fabric-client/lib/Orderer';
import Peer from 'fabric-client/lib/Peer';
import ChannelEventHub from 'fabric-client/lib/ChannelEventHub';
import User from 'fabric-client/lib/User';
import CAClient from 'fabric-ca-client';
import {
  snakeToCamelCase,
  camelToSnakeCase
} from 'json-style-converter';

process.env.GOPATH = resolve(__dirname, '../../chaincode');
const JOIN_TIMEOUT = 120000,
  TRANSACTION_TIMEOUT = 120000;

export class OrganizationClient extends EventEmitter {

  constructor(channelName, ordererConfig, peerConfig, caConfig, admin) {
    super();
    this._channelName = channelName;
    this._ordererConfig = ordererConfig;
    this._peerConfig = peerConfig;
    this._caConfig = caConfig;
    this._admin = admin;
    this._peers = [];
    this._eventHubs = [];
    this._client = new hfc();

    // Setup channel
    this._channel = this._client.newChannel(channelName);

    // Setup orderer and peers
    const orderer = this._client.newOrderer(ordererConfig.url, {
      pem: ordererConfig.pem,
      'ssl-target-name-override': ordererConfig.hostname
    });

    this._channel.addOrderer(orderer);

    const defaultPeer = this._client.newPeer(peerConfig.url, {
      pem: peerConfig.pem,
      'ssl-target-name-override': peerConfig.hostname
    });

    this._peers.push(defaultPeer);
    this._channel.addPeer(defaultPeer);
    let defaultEventHub;
    if (config.isUbuntu){
      defaultEventHub = this._channel.newChannelEventHub(defaultPeer);
    } else {
      defaultEventHub = this._channel.newChannelEventHub(this.defaultPeer);
    }
    this._eventHubs.push(defaultEventHub);
    this._adminUser = null;
  }

  async login() {
    try {
      this._client.setStateStore(
        await hfc.newDefaultKeyValueStore({
          path: `./${this._peerConfig.hostname}`
        }));
      this._adminUser = await getSubmitter(
        this._client, "admin", "adminpw", this._caConfig);
    } catch (e) {
      console.log(`Failed to enroll user. Error: ${e.message}`);
      throw e;
    }
  }

  connectAndRegisterBlockEvent() {
    // Setup event hubs 
    try {
      this._eventHubs[0].connect({full_block: true});
      this._eventHubs[0].registerBlockEvent(
          (block) => {
             this.emit('block', unmarshalBlock(block));
          },
          (err) => {
             console.log(err);
          }
      );
    } catch (e) {
      console.log(`Failed to connect and register block event. Error ${e.message}`);
      throw e;
    }
  }

  async getOrgAdmin() {
    return this._client.createUser({
      username: `Admin@${this._peerConfig.hostname}`,
      mspid: this._caConfig.mspId,
      cryptoContent: {
        privateKeyPEM: this._admin.key,
        signedCertPEM: this._admin.cert
      }
    });
  }

  async initialize() {
    try {
      await this._channel.initialize();
    } catch (e) {
      console.log(`Failed to initialize chain. Error: ${e.message}`);
      throw e;
    }
  }

  async createChannel(envelope) {
    const txId = this._client.newTransactionID();
    const channelConfig = this._client.extractChannelConfig(envelope);
    const signature = this._client.signChannelConfig(channelConfig);
    const request = {
      name: this._channelName,
      orderer: this._channel.getOrderers()[0],
      config: channelConfig,
      signatures: [signature],
      txId
    };
    const response = await this._client.createChannel(request);

    // Wait for 5sec to create channel
    await new Promise(resolve => {
      setTimeout(resolve, 5000);
    });
    return response;
  }

  async joinChannel() {
    try {
      const genesisBlock = await this._channel.getGenesisBlock({
        txId: this._client.newTransactionID()
      });
      const request = {
        targets: this._peers,
        txId: this._client.newTransactionID(),
        block: genesisBlock
      };
      await this._channel.joinChannel(request, JOIN_TIMEOUT);
      // Check if Joined
      this._eventHubs.map(eh => {
        eh.connect({full_block: true});
        return new Promise((resolve, reject) => {
          let blockRegistration = eh.registerBlockEvent(
              (block) => {
                eh.unregisterBlockEvent(blockRegistration);
                if (block.data.data.length === 1 && block.data.data[0].payload.header.channel_header.channel_id === this._channelName) {
                  console.log('Peer joined default channel');
                  resolve();
                } else {
                  reject(new Error('Peer did not join an expected channel.'));
                }
              },
              (err) => {
                console.log(err);
              }
          );
          const responseTimeout = setTimeout(() => {
            eh.unregisterBlockEvent(blockRegistration);
            reject(new Error('Peer did not respond in a timely fashion!'));
          }, JOIN_TIMEOUT);
        });
      });
    } catch (e) {
      console.log(`Error joining peer to channel. Error: ${e.message}`);
      throw e;
    }
  }

  async checkChannelMembership() {
    try {
      const { channels } = await this._client.queryChannels(this._peers[0]);
      if (!Array.isArray(channels)) {
        return false;
      }
      return channels.some(({channel_id}) => channel_id === this._channelName);
    } catch (e) {
      return false;
    }
  }

  async checkInstalled(chaincodeId, chaincodeVersion, chaincodePath) {
    let {
      chaincodes
    } = await this._channel.queryInstantiatedChaincodes();
    if (!Array.isArray(chaincodes)) {
      return false;
    }
    return chaincodes.some(cc =>
      cc.name === chaincodeId &&
      cc.path === chaincodePath &&
      cc.version === chaincodeVersion);
  }

  async install(chaincodeId, chaincodeVersion, chaincodePath) {
    const request = {
      targets: this._peers,
      chaincodePath,
      chaincodeId,
      chaincodeVersion
    };

    // Make install proposal to all peers
    let results;
    try {
      results = await this._client.installChaincode(request);
    } catch (e) {
      console.log(
        `Error sending install proposal to peer! Error: ${e.message}`);
      throw e;
    }
    const proposalResponses = results[0];
    const allGood = proposalResponses
      .every(pr => pr.response && pr.response.status == 200);
    return allGood;
  }

  async instantiate(chaincodeId, chaincodeVersion, ...args) {
    let proposalResponses, proposal;
    const txId = this._client.newTransactionID();
    try {
      const request = {
        chaincodeType: 'golang',
        chaincodeId,
        chaincodeVersion,
        fcn: 'init',
        args: marshalArgs(args),
        txId
      };
      const results = await this._channel.sendInstantiateProposal(request);
      proposalResponses = results[0];
      proposal = results[1];

      let allGood = proposalResponses
        .every(pr => pr.response && pr.response.status == 200);

      if (!allGood) {
        throw new Error(
          `Proposal rejected by some (all) of the peers: ${proposalResponses}`);
      }
    } catch (e) {
      throw e;
    }

    try {
      const request = {
        proposalResponses,
        proposal
      };
      const deployId = txId.getTransactionID();
      const transactionCompletePromises = this._eventHubs.map(eh => {
        eh.connect();

        return new Promise((resolve, reject) => {
          // Set timeout for the transaction response from the current peer
          const responseTimeout = setTimeout(() => {
            eh.unregisterTxEvent(deployId);
            reject(new Error('Peer did not respond in a timely fashion!'));
          }, TRANSACTION_TIMEOUT);

          eh.registerTxEvent(deployId, (tx, code) => {
            clearTimeout(responseTimeout);
            eh.unregisterTxEvent(deployId);
            if (code != 'VALID') {
              reject(new Error(
                `Peer has rejected transaction with code: ${code}`));
            } else {
              resolve();
            }
          });
        });
      });

      transactionCompletePromises.push(this._channel.sendTransaction(request));
      await transactionCompletePromises;
    } catch (e) {
      throw e;
    }
  }

  async invoke(chaincodeId, chaincodeVersion, fcn, ...args) {
    let proposalResponses, proposal;
    const txId = this._client.newTransactionID();
    try {
      const request = {
        chaincodeId,
        chaincodeVersion,
        fcn,
        args: marshalArgs(args),
        txId
      };
      const results = await this._channel.sendTransactionProposal(request);
      proposalResponses = results[0];
      proposal = results[1];

      const allGood = proposalResponses
        .every(pr => pr.response && pr.response.status == 200);

      if (!allGood) {
        throw new Error(
          `Proposal rejected by some (all) of the peers: ${proposalResponses}`);
      }
    } catch (e) {
      throw e;
    }

    try {
      const request = {
        proposalResponses,
        proposal
      };

      const transactionId = txId.getTransactionID();
      const transactionCompletePromises = this._eventHubs.map(eh => {
        eh.connect();

        return new Promise((resolve, reject) => {
          // Set timeout for the transaction response from the current peer
          const responseTimeout = setTimeout(() => {
            eh.unregisterTxEvent(transactionId);
            reject(new Error('Peer did not respond in a timely fashion!'));
          }, TRANSACTION_TIMEOUT);

          eh.registerTxEvent(transactionId, (tx, code) => {
            clearTimeout(responseTimeout);
            eh.unregisterTxEvent(transactionId);
            if (code != 'VALID') {
              reject(new Error(
                `Peer has rejected transaction with code: ${code}`));
            } else {
              resolve();
            }
          });
        });
      });

      transactionCompletePromises.push(this._channel.sendTransaction(request));
      try {
        await transactionCompletePromises;
        const payload = proposalResponses[0].response.payload;
        return unmarshalResult([payload]);
      } catch (e) {
        throw e;
      }
    } catch (e) {
      throw e;
    }
  }

  async query(chaincodeId, chaincodeVersion, fcn, ...args) {
    const request = {
      chaincodeId,
      chaincodeVersion,
      fcn,
      args: marshalArgs(args),
      txId: this._client.newTransactionID(),
    };
    return unmarshalResult(await this._channel.queryByChaincode(request));
  }

  async getBlocks(noOfLastBlocks) {
    if (typeof noOfLastBlocks !== 'number' &&
      typeof noOfLastBlocks !== 'string') {
      return [];
    }

    const {
      height
    } = await this._channel.queryInfo();
    let blockCount;
    if (height.comp(noOfLastBlocks) > 0) {
      blockCount = noOfLastBlocks;
    } else {
      blockCount = height;
    }
    if (typeof blockCount === 'number') {
      blockCount = Long.fromNumber(blockCount, height.unsigned);
    } else if (typeof blockCount === 'string') {
      blockCount = Long.fromString(blockCount, height.unsigned);
    }
    blockCount = blockCount.toNumber();
    const queryBlock = this._channel.queryBlock.bind(this._channel);
    const blockPromises = {};
    blockPromises[Symbol.iterator] = function* () {
      for (let i = 1; i <= blockCount; i++) {
        yield queryBlock(height.sub(i).toNumber());
      }
    };
    const blocks = await Promise.all([...blockPromises]);
    return blocks.map(unmarshalBlock);
  }
}

/**
 * Enrolls a user with the respective CA.
 *
 * @export
 * @param {string} client
 * @param {string} enrollmentID
 * @param {string} enrollmentSecret
 * @param {object} { url, mspId }
 * @returns the User object
 */
async function getSubmitter(
  client, enrollmentID, enrollmentSecret, {
    url,
    mspId
  }) {

  try {
    let user = await client.getUserContext(enrollmentID, true);
    if (user && user.isEnrolled()) {
      return user;
    }

    // Need to enroll with CA server
    const ca = new CAClient(url, {
      verify: false
    });
    try {
      const enrollment = await ca.enroll({
        enrollmentID,
        enrollmentSecret
      });
      user = new User(enrollmentID, client);
      await user.setEnrollment(enrollment.key, enrollment.certificate, mspId);
      await client.setUserContext(user);
      return user;
    } catch (e) {
      throw new Error(
        `Failed to enroll and persist User. Error: ${e.message}`);
    }
  } catch (e) {
    throw new Error(`Could not get UserContext! Error: ${e.message}`);
  }
}

export function wrapError(message, innerError) {
  let error = new Error(message);
  error.inner = innerError;
  console.log(error.message);
  throw error;
}

export function marshalArgs(args) {
  if (!args) {
    return args;
  }

  if (typeof args === 'string') {
    return [args];
  }

  let snakeArgs = camelToSnakeCase(args);

  if (Array.isArray(args)) {
    return snakeArgs.map(
      arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());
  }

  if (typeof args === 'object') {
    return [JSON.stringify(snakeArgs)];
  }
}

function unmarshalResult(result) {
  if (!Array.isArray(result)) {
    return result;
  }
  let buff = Buffer.concat(result);
  if (!Buffer.isBuffer(buff)) {
    return result;
  }
  let json = buff.toString('utf8');
  if (!json) {
    return null;
  }
  let obj = JSON.parse(json);
  return snakeToCamelCase(obj);
}

function unmarshalBlock(block) {
  const transactions = Array.isArray(block.data.data) ?
    block.data.data.map(({
      payload: {
        header,
        data
      }
    }) => {
      const {
        channel_header
      } = header;
      const {
        type,
        timestamp,
        epoch
      } = channel_header;
      return {
        type,
        timestamp
      };
    }) : [];
  return {
    id: block.header.number.toString(),
    fingerprint: block.header.data_hash.slice(0, 20),
    transactions
  };
}
