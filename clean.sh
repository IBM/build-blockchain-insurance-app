#!/bin/bash

docker rm -f $(docker ps -aq)
images=( web insurance-peer orderer police-peer repairshop-ca shop-ca police-ca insurance-ca repairshop-peer shop-peer )
for i in "${images[@]}"
do
	echo Removing image : $i
  docker rmi -f $i
done

#docker rmi -f $(docker images | grep none)
images=( dev-repairshop-peer dev-police-peer dev-insurance-peer dev-shop-peer)
for i in "${images[@]}"
do
	echo Removing image : $i
  docker rmi -f $(docker images | grep $i )
done
