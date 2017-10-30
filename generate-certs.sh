#!/bin/sh
set -e

echo
echo "#################################################################"
echo "#######        Generating cryptographic material       ##########"
echo "#################################################################"
PROJPATH=$(pwd)
CLIPATH=$PROJPATH/cli/peers
ORDERERS=$CLIPATH/ordererOrganizations
PEERS=$CLIPATH/peerOrganizations

rm -rf $CLIPATH
$PROJPATH/cryptogen generate --config=$PROJPATH/crypto-config.yaml --output=$CLIPATH

sh generate-cfgtx.sh

rm -rf $PROJPATH/{orderer,insurancePeer,policePeer,repairShopPeer,shopPeer}/crypto
mkdir $PROJPATH/{orderer,insurancePeer,policePeer,repairShopPeer,shopPeer}/crypto
cp -r $ORDERERS/orderer-org/orderers/orderer0/{msp,tls} $PROJPATH/orderer/crypto
cp -r $PEERS/insurance-org/peers/insurance-peer/{msp,tls} $PROJPATH/insurancePeer/crypto
cp -r $PEERS/police-org/peers/police-peer/{msp,tls} $PROJPATH/policePeer/crypto
cp -r $PEERS/repairshop-org/peers/repairshop-peer/{msp,tls} $PROJPATH/repairShopPeer/crypto
cp -r $PEERS/shop-org/peers/shop-peer/{msp,tls} $PROJPATH/shopPeer/crypto
cp $CLIPATH/genesis.block $PROJPATH/orderer/crypto/

INSURANCECAPATH=$PROJPATH/insuranceCA
POLICECAPATH=$PROJPATH/policeCA
REPAIRSHOPCAPATH=$PROJPATH/repairShopCA
SHOPCAPATH=$PROJPATH/shopCA

rm -rf {$INSURANCECAPATH,$POLICECAPATH,$REPAIRSHOPCAPATH,$SHOPCAPATH}/{ca,tls}
mkdir -p {$INSURANCECAPATH,$POLICECAPATH,$REPAIRSHOPCAPATH,$SHOPCAPATH}/{ca,tls}
cp $PEERS/insurance-org/ca/* $INSURANCECAPATH/ca
cp $PEERS/insurance-org/tlsca/* $INSURANCECAPATH/tls
mv $INSURANCECAPATH/ca/*_sk $INSURANCECAPATH/ca/key.pem
mv $INSURANCECAPATH/ca/*-cert.pem $INSURANCECAPATH/ca/cert.pem
mv $INSURANCECAPATH/tls/*_sk $INSURANCECAPATH/tls/key.pem
mv $INSURANCECAPATH/tls/*-cert.pem $INSURANCECAPATH/tls/cert.pem

cp $PEERS/police-org/ca/* $POLICECAPATH/ca
cp $PEERS/police-org/tlsca/* $POLICECAPATH/tls
mv $POLICECAPATH/ca/*_sk $POLICECAPATH/ca/key.pem
mv $POLICECAPATH/ca/*-cert.pem $POLICECAPATH/ca/cert.pem
mv $POLICECAPATH/tls/*_sk $POLICECAPATH/tls/key.pem
mv $POLICECAPATH/tls/*-cert.pem $POLICECAPATH/tls/cert.pem

cp $PEERS/repairshop-org/ca/* $REPAIRSHOPCAPATH/ca
cp $PEERS/repairshop-org/tlsca/* $REPAIRSHOPCAPATH/tls
mv $REPAIRSHOPCAPATH/ca/*_sk $REPAIRSHOPCAPATH/ca/key.pem
mv $REPAIRSHOPCAPATH/ca/*-cert.pem $REPAIRSHOPCAPATH/ca/cert.pem
mv $REPAIRSHOPCAPATH/tls/*_sk $REPAIRSHOPCAPATH/tls/key.pem
mv $REPAIRSHOPCAPATH/tls/*-cert.pem $REPAIRSHOPCAPATH/tls/cert.pem

cp $PEERS/shop-org/ca/* $SHOPCAPATH/ca
cp $PEERS/shop-org/tlsca/* $SHOPCAPATH/tls
mv $SHOPCAPATH/ca/*_sk $SHOPCAPATH/ca/key.pem
mv $SHOPCAPATH/ca/*-cert.pem $SHOPCAPATH/ca/cert.pem
mv $SHOPCAPATH/tls/*_sk $SHOPCAPATH/tls/key.pem
mv $SHOPCAPATH/tls/*-cert.pem $SHOPCAPATH/tls/cert.pem

WEBCERTS=$PROJPATH/web/certs
rm -rf $WEBCERTS
mkdir -p $WEBCERTS
cp $PROJPATH/orderer/crypto/tls/ca.crt $WEBCERTS/ordererOrg.pem
cp $PROJPATH/insurancePeer/crypto/tls/ca.crt $WEBCERTS/insuranceOrg.pem
cp $PROJPATH/policePeer/crypto/tls/ca.crt $WEBCERTS/policeOrg.pem
cp $PROJPATH/repairShopPeer/crypto/tls/ca.crt $WEBCERTS/repairShopOrg.pem
cp $PROJPATH/shopPeer/crypto/tls/ca.crt $WEBCERTS/shopOrg.pem
cp $PEERS/insurance-org/users/Admin@insurance-org/msp/keystore/* $WEBCERTS/Admin@insurance-org-key.pem
cp $PEERS/insurance-org/users/Admin@insurance-org/msp/signcerts/* $WEBCERTS/
cp $PEERS/shop-org/users/Admin@shop-org/msp/keystore/* $WEBCERTS/Admin@shop-org-key.pem
cp $PEERS/shop-org/users/Admin@shop-org/msp/signcerts/* $WEBCERTS/
cp $PEERS/police-org/users/Admin@police-org/msp/keystore/* $WEBCERTS/Admin@police-org-key.pem
cp $PEERS/police-org/users/Admin@police-org/msp/signcerts/* $WEBCERTS/
cp $PEERS/repairshop-org/users/Admin@repairshop-org/msp/keystore/* $WEBCERTS/Admin@repairshop-org-key.pem
cp $PEERS/repairshop-org/users/Admin@repairshop-org/msp/signcerts/* $WEBCERTS/
