# Build Blockchain Insurance Application

This project showcases the use of blockchain in insurance domain for claim processing. In this application, we have four participants, namely insurance, police, repair shop and shop peer. Insurance peer is the insurance company providing the insurance for the products and it is responsible for processing the claims. Police peer is responsible for verifying the theft claims. Repair shop peer is responsible for repairs of the product while shop peer sells the products to consumer.


## Included Components
* Hyperledger Fabric
* Docker

## Application Workflow Diagram
![Workflow](images/workflow.png)

* Generate Certificates for peers
* Build Docker images for network
* Start the insurance network

## Prerequisites

* [Docker](https://www.docker.com/products/overview) - v1.13 or higher
* [Docker Compose](https://docs.docker.com/compose/overview/) - v1.8 or higher
* [Node.js & npm](https://nodejs.org/en/download/) - node v6.2.0 - v6.10.0 (v7+ not supported); npm comes with your node installation.
* [Git client](https://git-scm.com/downloads) - needed for clone commands

## Quick Start Steps for Mac and Ubuntu
for mac user:
1. git clone https://github.com/IBM/build-blockchain-insurance-app.git
2. cd build-blockchain-insurance-app.git
3. ./build_mac.sh
4. Use the link http://localhost:3000 to load the web application in browser.<br>

for Ubuntu user:<br>

1. git clone https://github.com/IBM/build-blockchain-insurance-app.git
2. cd build-blockchain-insurance-app.git
3. ./build_ubuntu.sh
4. Use the link http://youe_ip:3000 to load the web application in browser.

## Regular install Steps

1. [Download the docker images](#1-download-the-docker-images)
2. [Run the application](#2-run-the-application)

## 1. Download the docker images

Clone the repository:
```bash
git clone https://github.com/IBM/build-blockchain-insurance-app.git
```

From your workspace, export the path for Fabric
```bash
cd build-blockchain-insurance-app
export FABRIC_CFG_PATH=$PWD
```

Login using your [docker hub](https://hub.docker.com/) credentials.
```bash
docker login
```

Run `build.sh` shell script to download and create docker images for the orderer, insurance-peer, police-peer, shop-peer, repairshop-peer, web application and certificate authorities for each peer.
```bash
./build.sh
```

## 2. Run the application

`docker-compose.yaml` contains the configuration to setup the network for the insurance application.

Run the insurance application.
```bash
docker-compose up -d
```

You should see the following output on console:
```
Creating repairshop-ca ...
Creating insurance-ca ...
Creating shop-ca ...
Creating police-ca ...
Creating orderer0 ...
Creating repairshop-ca
Creating insurance-ca
Creating police-ca
Creating shop-ca
Creating orderer0 ... done
Creating insurance-peer ...
Creating insurance-peer ... done
Creating shop-peer ...
Creating shop-peer ... done
Creating repairshop-peer ...
Creating repairshop-peer ... done
Creating web ...
Creating police-peer ...
Creating web
Creating police-peer ... done
```

**Wait for few minutes for application to install and instantiate the chaincode on network**

Check the status of installation using command:
```bash
docker logs web
```
On completion, you should see the following output on console:
```
npm info it worked if it ends with ok
npm info using npm@3.10.10
npm info using node@v6.11.3
npm info lifecycle blockchain-for-insurance@2.1.0~preserve: blockchain-for-insurance@2.1.0
npm info lifecycle blockchain-for-insurance@2.1.0~serve: blockchain-for-insurance@2.1.0

> blockchain-for-insurance@2.1.0 serve /app
> cross-env NODE_ENV=production node ./bin/server

/app/app/static/js
Server running on port: 3000
info: [EventHub.js]: _connect - options {"grpc.ssl_target_name_override":"insurance-peer","grpc.default_authority":"insurance-peer"}
info: [EventHub.js]: _connect - options {"grpc.ssl_target_name_override":"shop-peer","grpc.default_authority":"shop-peer"}
info: [EventHub.js]: _connect - options {"grpc.ssl_target_name_override":"repairshop-peer","grpc.default_authority":"repairshop-peer"}
info: [EventHub.js]: _connect - options {"grpc.ssl_target_name_override":"police-peer","grpc.default_authority":"police-peer"}
Default channel not found, attempting creation...
Successfully created a new default channel.
Joining peers to the default channel.
Chaincode is not installed, attempting installation...
Base container image present.
info: [packager/Golang.js]: packaging GOLANG from bcins
info: [packager/Golang.js]: packaging GOLANG from bcins
info: [packager/Golang.js]: packaging GOLANG from bcins
info: [packager/Golang.js]: packaging GOLANG from bcins
Successfully installed chaincode on the default channel.
Successfully instantiated chaincode on all peers.
```

Use the link http://localhost:3000 to load the web application in browser.

The home page shows the participants (Peers) in the network. You can see that there is an Insurance, Repair Shop, Police and Shop Peer implemented. They are the participants of the network.

![Blockchain Insurance](images/home.png)

Imagine being a consumer (hereinafter called “Biker”) that wants to buy a phone, bike or Ski. By clicking on the “Go to the shop” section, you will be redirected to the shop (shop peer) that offers you the following products.

![Customer Shopping](images/Picture1.png)

You can see the three products offered by the shop(s) now. In addition, you have insurance contracts available for them. In our scenario, you are an outdoor sport enthusiast who wants to buy a new Bike. Therefore, you’ll click on the Bike Shop section.

![Shopping](images/Picture2.png)

In this section, you are viewing the different bikes available in the store. You can select within four different Bikes. By clicking on next you’ll be forwarded to the next page which will ask for the customer’s personal data.

![Bike Shop](images/Picture3.png)

You have the choice between different insurance contracts that feature different coverage as well as terms and conditions. You are required to type-in your personal data and select a start and end date of the contract. Since there is a trend of short-term or event-driven contracts in the insurance industry you have the chance to select the duration of the contract on a daily basis. The daily price of the insurance contract is being calculated by a formula that had been defined in the chaincode. By clicking on next you will be forwarded to a screen that summarizes your purchase and shows you the total sum.

![Bike Insurance](images/Picture4.png)

The application will show you the total sum of your purchase. By clicking on “order” you agree to the terms and conditions and close the deal (signing of the contract). In addition, you’ll receive a unique username and password. The login credentials will be used once you file a claim.  A block is being written to the Blockchain.

>note You can see the block by clicking on the black arrow on the bottom-right.

![Bike Insurance](images/Picture5.png)

Login credentials. Block written to the chain.

![Login Credentials](images/Picture6.png)

Once an incident has happened the Biker can file a claim on his own by selecting the “claim Self-Service” tab.

![Claim Service](images/Picture61.png)

The Biker will be asked to login by using the credentials that had been given to him before.

![Login](images/Picture7.png)

He can file a new claim by selecting the tab shown above.

![File Claim](images/Picture8.png)

The Biker can briefly describe the damage on his bike and/or select whether it has been stolen. In case the Bike has been stolen the claim will be processed through the police who has to confirm or deny the theft (option 1). In case there was just a damage the claim will be processed through the repair shop (option 2). In the following section, we will start with option 1.

![Claim Description](images/Picture9.png)

**Option 1**

Once the Biker has submitted the claim it will be shown in the box marked in red. Furthermore, another block is being written to the chain.
![Claim Block](images/Picture10.png)

The Biker can also view the active claims.

![Active Claims](images/Picture11.png)

By selecting “claim processing” the Insurance company can view all active claims that have not been processed yet. A clerk can decide on the claims in this view. Since we are still looking at option 1 the theft has to be confirmed or denied by the police. Therefore, the insurance company can only reject the claim at this point in stage.

![Claim Processing](images/Picture12.png)

The Police Peer can view the claims that include theft. In case the bike has been reported stolen they can confirm the claim and include a file reference number. In case no theft has been reported they can reject the claim and it will not be processed.

![Police Peer](images/Picture13.png)

Let’s assume the Biker did not rip-off the insurance company and has reported the bike as stolen. The police will confirm the claim which results in another Block being written to the chain.

![Police Transaction](images/Picture14.png)

Going back to the “claim processing” tab you can see that the insurance company has the option to reimburse the claim now because the police had confirmed that the bike has been stolen. Block is being written to the chain

![Claim Processing](images/Picture15.png)

The Biker can see the new status of his claim which changed to reimbursed.

![User login](images/Picture16.png)

**Option 2**

Option 2 covers the case of an accident.

![Accident](images/Picture17.png)

The insurance “claim processing” tab shows the unprocessed claims. A clerk can choose between three options on how to process the claim. “Reject” will stop the claim process whereas “reimburse” leads directly to the payment to the customer. In case something needs to be repaired the insurance company has the option to select “repair”. This will forward the claim to a repair shop and will generate a repair order. A block is being written to the chain.

![Claim Processing](images/Picture18.png)

The Repair Shop will get a message showing the repair order. Once they’ve done the repair works the repair shop can mark the order as completed. Afterwards, the insurance company will get a message to proceed the payment to the repair shop. a block is being written to the chain

![Reapir Shop](images/Picture19.png)

The Biker can see in his “claim self-service” tab that the claim has been resolved and the bike was repaired by the shop.

![Claim Status](images/Picture20.png)

The insurance company has the option to activate or deactivate certain contracts. This does not mean that contracts that have already been signed by customers will be no longer valid. It just does not allow new signings for these types of contracts. In addition, the insurance company has the possibility to create new contract templates that have different terms and conditions and a different pricing.  Any transaction will result in a block being written to the chain.

![Contract Management](images/Picture21.png)

## Additional resources
Following is a list of additional blockchain resources:
* [Fundamentals of IBM Blockchain](https://www.ibm.com/blockchain/what-is-blockchain.html)
* [Hyperledger Fabric Documentation](http://fabric-rtd.readthedocs.io/en/latest/getting_started.html)
* [Hyperledger Fabric code on GitHub](https://github.com/hyperledger/fabric)

## Troubleshooting

* Run `clean.sh` to remove the docker images and containers for the insurance network.
```bash
./clean.sh
```
## License
[Apache 2.0](LICENSE)
