//Import Hyperledger Fabric 1.4 programming model - fabric-network
const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');

//function used to prepare args for smart contract invokation
import { marshalArgs } from './utils';
import * as util from 'util' // has no default export

//connect to the config file
const configPath = path.join(process.cwd(), './www/blockchain/config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

// connect to the connection file
const ccpPath = path.join(process.cwd(), './www/blockchain/ibpConnection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const connectionProfile = JSON.parse(ccpJSON);

// A wallet stores a collection of identities for use
const walletPath = path.join(process.cwd(), './www/blockchain/wallet');
const wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);

exports.invokeCC = async function (isQuery, peerIdentity, fcn, args) {

  try {

    let response;

    console.log(`invokeCC called, function: ${fcn} and the args: `)
    console.log(args)

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(peerIdentity);
    if (!userExists) {
      console.log('An identity for the user ' + peerIdentity + ' does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      response.error = 'An identity for the user ' + peerIdentity + ' does not exist in the wallet. Register ' + peerIdentity + ' first';
      return response;
    }

    //connect to Fabric Network, but starting a new gateway
    const gateway = new Gateway();

    //use our config file, our peerIdentity, and our discovery options to connect to Fabric network.
    await gateway.connect(connectionProfile, { wallet, identity: peerIdentity, discovery: config.gatewayDiscovery });

    //connect to our channel that has been created on IBM Blockchain Platform
    const network = await gateway.getNetwork('mychannel');

    //connect to our insurance contract that has been installed / instantiated on IBM Blockchain Platform
    const contract = await network.getContract('insurance');

    //prepare our arguments for smart contract  
    args = marshalArgs(args)

    //submit transaction to the smart contract that is installed / instnatiated on the peers
    if (isQuery) {
      console.log('calling contract.evaluateTransaction, with args');
      if (args) {
        response = await contract.evaluateTransaction(fcn, args[0]);
        response = JSON.parse(response.toString());
        console.log(`response from evaluateTransaction: ${(response)}`)
      } else {
        console.log('calling contract.evaluateTransaction, with no args');
        response = await contract.evaluateTransaction(fcn);
        response = JSON.parse(response.toString());
        console.log(`response from evaluateTransaction: ${(response)}`)
      }
    } else {
      console.log('calling contract.submitTransaction');
      response = await contract.submitTransaction(fcn, args[0]);
      // response = JSON.parse(response.toString());
      console.log(`response from submitTransaction: ${(response)}`)
    }

    console.log('Transaction has been submitted');

    // Disconnect from the gateway.
    await gateway.disconnect();

  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
  }
}
