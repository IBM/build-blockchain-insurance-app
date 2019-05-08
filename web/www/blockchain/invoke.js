const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
import { wrapError, marshalArgs } from './utils';


const path = require('path');

const configPath = path.join(process.cwd(), './www/blockchain/config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
var userName = config.userName;
var gatewayDiscovery = config.gatewayDiscovery;
var connection_file = config.connection_file;

import * as util from 'util' // has no default export

// connect to the connection file
const ccpPath = path.join(process.cwd(), './www/blockchain/ibpConnection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// A wallet stores a collection of identities for use
const walletPath = path.join(process.cwd(), './www/blockchain/wallet');
const wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);

exports.invokeCC = async function (fcn, args) {
  try {

    let response;


    console.log('invokeCC called, which is using the new HLF 1.4 mechanism')
    console.log(`function: ${fcn} and the args:`)
    console.log(args)

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(userName);
    if (!userExists) {
      console.log('An identity for the user ' + userName + ' does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
      return response;
    }
    // console.log(`ccp: ${util.inspect(ccp)}`)

    console.log('before gateway NewGateWay')
    const gateway = new Gateway();
    console.log('before gateway.connect')
    await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });

    // console.log(`gateway: ${util.inspect(gateway)}`)

    console.log('after gateway.connect, before getting network')
    const network = await gateway.getNetwork('mychannel-all-ca-as-operators');

    console.log('before getting contract')
    const contract = await network.getContract('insurance');
    console.log('after getting contract')

    if (!args) {
      console.log('!no args!!')
      response = await contract.submitTransaction(fcn);
    } else {
      console.log(`func in insurancePeer invoke: ${util.inspect(fcn)}`)

      console.log(`before calling marshal, args: ${util.inspect(args)}`)

      args = marshalArgs(args)
      console.log(`after marshalArgs, args[0]: ${util.inspect(args[0])}`)

      response = await contract.submitTransaction(fcn, args[0]);
      console.log('after contract.submitTransaction')
    }

    console.log('Transaction has been submitted');

    // Disconnect from the gateway.
    await gateway.disconnect();

  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    // response.error = error.message;
    // return response;
  }
}

exports.queryCC = async function (fcn, args) {
  try {

    console.log('invokeCC called, which is using the new HLF 1.4 mechanism')
    console.log(`function: ${fcn} and the args:`)
    console.log(args)

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(userName);
    if (!userExists) {
      console.log('An identity for the user ' + userName + ' does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      response.error = 'An identity for the user ' + userName + ' does not exist in the wallet. Register ' + userName + ' first';
      return response;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: userName, discovery: gatewayDiscovery });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel1');

    // Get the contract from the network.
    const contract = await network.getContract('insurance');

    let response;
    if (!args) {
      response = await contract.evaluateTransaction(fcn);
    } else {
      args = JSON.stringify(args)
      console.log(`after calling args.stringify(), args: ${args}`)
      response = await contract.evaluateTransaction(fcn, args);
    }

    console.log('Transaction has been submitted');

    // Disconnect from the gateway.
    await gateway.disconnect();

  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    response.error = error.message;
    return response;
  }
}
