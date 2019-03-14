'use strict';

import config, { DEFAULT_CONTRACT_TYPES } from './config';
import { OrganizationClient } from './utils';
import http from 'http';
import url from 'url';

let status = 'down';
let statusChangedCallbacks = [];

// Setup clients per organization
const insuranceClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.insuranceOrg.peer,
  config.insuranceOrg.ca,
  config.insuranceOrg.admin
);
const shopClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.shopOrg.peer,
  config.shopOrg.ca,
  config.shopOrg.admin
);
const repairShopClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.repairShopOrg.peer,
  config.repairShopOrg.ca,
  config.repairShopOrg.admin
);
const policeClient = new OrganizationClient(
  config.channelName,
  config.orderer0,
  config.policeOrg.peer,
  config.policeOrg.ca,
  config.policeOrg.admin
);

function setStatus(s) {
  status = s;

  setTimeout(() => {
    statusChangedCallbacks
      .filter(f => typeof f === 'function')
      .forEach(f => f(s));
  }, 1000);
}

export function subscribeStatus(cb) {
  if (typeof cb === 'function') {
    statusChangedCallbacks.push(cb);
  }
}

export function getStatus() {
  return status;
}

export function isReady() {
  return status === 'ready';
}

function getAdminOrgs() {
  return Promise.all([
    insuranceClient.getOrgAdmin(),
    shopClient.getOrgAdmin(),
    repairShopClient.getOrgAdmin(),
    policeClient.getOrgAdmin()
  ]);
}

(async () => {
  // Login
  try {
    await Promise.all([
      insuranceClient.login(),
      shopClient.login(),
      repairShopClient.login(),
      policeClient.login()
    ]);
  } catch (e) {
    console.log('Fatal error logging into blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  // Bootstrap blockchain network
  try {
    await getAdminOrgs();
    if (!(await insuranceClient.checkChannelMembership())) {
      console.log('Default channel not found, attempting creation...');
      const createChannelResponse =
        await insuranceClient.createChannel(config.channelConfig);
      if (createChannelResponse.status === 'SUCCESS') {
        console.log('Successfully created a new default channel.');
        console.log('Joining peers to the default channel.');
        await Promise.all([
          insuranceClient.joinChannel(),
          shopClient.joinChannel(),
          repairShopClient.joinChannel(),
          policeClient.joinChannel()
        ]);
        // Wait for 10s for the peers to join the newly created channel
        await new Promise(resolve => {
          setTimeout(resolve, 10000);
        });
      }
    }
  } catch (e) {
    console.log('Fatal error bootstrapping the blockchain network!');
    console.log(e);
    process.exit(-1);
  }

  // Register block events
  try {
    console.log('Connecting and Registering Block Events');
    insuranceClient.connectAndRegisterBlockEvent();
    shopClient.connectAndRegisterBlockEvent();
    repairShopClient.connectAndRegisterBlockEvent();
    policeClient.connectAndRegisterBlockEvent();
  } catch (e) {
  console.log('Fatal error register block event!');
  console.log(e);
  process.exit(-1);
  }

  // Initialize network
  try {
    await Promise.all([
      insuranceClient.initialize(),
      shopClient.initialize(),
      repairShopClient.initialize(),
      policeClient.initialize()
    ]);
  } catch (e) {
    console.log('Fatal error initializing blockchain organization clients!');
    console.log(e);
    process.exit(-1);
  }

  // Install chaincode on all peers
  let installedOnInsuranceOrg, installedOnShopOrg, installedOnRepairShopOrg,
    installedOnPoliceOrg;
  try {
    await getAdminOrgs();
    installedOnInsuranceOrg = await insuranceClient.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnShopOrg = await shopClient.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnRepairShopOrg = await repairShopClient.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnPoliceOrg = await policeClient.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
  } catch (e) {
    console.log('Fatal error getting installation status of the chaincode!');
    console.log(e);
    process.exit(-1);
  }

  if (!(installedOnInsuranceOrg && installedOnShopOrg &&
    installedOnRepairShopOrg && installedOnPoliceOrg)) {
    console.log('Chaincode is not installed, attempting installation...');

    // Pull chaincode environment base image
    try {
      await getAdminOrgs();
      const socketPath = process.env.DOCKER_SOCKET_PATH ||
      (process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock');
      const ccenvImage = process.env.DOCKER_CCENV_IMAGE ||
        'hyperledger/fabric-ccenv:latest';
      const listOpts = { socketPath, method: 'GET', path: '/images/json' };
      const pullOpts = {
        socketPath, method: 'POST',
        path: url.format({ pathname: '/images/create', query: { fromImage: ccenvImage } })
      };

      const images = await new Promise((resolve, reject) => {
        const req = http.request(listOpts, (response) => {
          let data = '';
          response.setEncoding('utf-8');
          response.on('data', chunk => { data += chunk; });
          response.on('end', () => { resolve(JSON.parse(data)); });
        });
        req.on('error', reject); req.end();
      });

      const imageExists = images.some(
        i => i.RepoTags && i.RepoTags.some(tag => tag === ccenvImage));
      if (!imageExists) {
        console.log(
          'Base container image not present, pulling from Docker Hub...');
        await new Promise((resolve, reject) => {
          const req = http.request(pullOpts, (response) => {
            response.on('data', () => { });
            response.on('end', () => { resolve(); });
          });
          req.on('error', reject); req.end();
        });
        console.log('Base container image downloaded.');
      } else {
        console.log('Base container image present.');
      }
    } catch (e) {
      console.log('Fatal error pulling docker images.');
      console.log(e);
      process.exit(-1);
    }

    // Install chaincode
    const installationPromises = [
      insuranceClient.install(
        config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
      shopClient.install(
        config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
      repairShopClient.install(
        config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
      policeClient.install(
        config.chaincodeId, config.chaincodeVersion, config.chaincodePath)
    ];
    try {
      await Promise.all(installationPromises);
      await new Promise(resolve => {   setTimeout(resolve, 10000); });
      console.log('Successfully installed chaincode on the default channel.');
    } catch (e) {
      console.log('Fatal error installing chaincode on the default channel!');
      console.log(e);
      process.exit(-1);
    }

    // Instantiate chaincode on all peers
    // Instantiating the chaincode on a single peer should be enough (for now)
    try {
      // Initial contract types
      await insuranceClient.instantiate(config.chaincodeId,
        config.chaincodeVersion, DEFAULT_CONTRACT_TYPES);
      console.log('Successfully instantiated chaincode on all peers.');
      setStatus('ready');
    } catch (e) {
      console.log('Fatal error instantiating chaincode on some(all) peers!');
      console.log(e);
      process.exit(-1);
    }
  } else {
    console.log('Chaincode already installed on the blockchain network.');
    setStatus('ready');
  }
})();

// Export organization clients
export {
  insuranceClient,
  shopClient,
  repairShopClient,
  policeClient
};
