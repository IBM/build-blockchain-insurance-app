#!/bin/sh

CHANNEL_NAME="default"
PROJPATH=$(pwd)
CLIPATH=$PROJPATH/cli/peers

echo
echo "##########################################################"
echo "#########  Generating Orderer Genesis block ##############"
echo "##########################################################"
$PROJPATH/configtxgen -profile FourOrgsGenesis -outputBlock $CLIPATH/genesis.block

echo
echo "#################################################################"
echo "### Generating channel configuration transaction 'channel.tx' ###"
echo "#################################################################"
$PROJPATH/configtxgen -profile FourOrgsChannel -outputCreateChannelTx $CLIPATH/channel.tx -channelID $CHANNEL_NAME
cp $CLIPATH/channel.tx $PROJPATH/web
echo
echo "#################################################################"
echo "####### Generating anchor peer update for InsuranceOrg ##########"
echo "#################################################################"
$PROJPATH/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate $CLIPATH/InsuranceOrgMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg InsuranceOrgMSP

echo
echo "#################################################################"
echo "#######    Generating anchor peer update for ShopOrg   ##########"
echo "#################################################################"
$PROJPATH/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate $CLIPATH/ShopOrgMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg ShopOrgMSP

echo
echo "##################################################################"
echo "####### Generating anchor peer update for RepairShopOrg ##########"
echo "##################################################################"
$PROJPATH/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate $CLIPATH/RepairShopOrgMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg RepairShopOrgMSP

echo
echo "##################################################################"
echo "#######   Generating anchor peer update for PoliceOrg   ##########"
echo "##################################################################"
$PROJPATH/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate $CLIPATH/PoliceOrgMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg PoliceOrgMSP
