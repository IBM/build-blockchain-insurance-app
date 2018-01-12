#!/bin/bash
cp ./binary_mac/* .
sh ./generate-certs.sh
sh ./docker-images.sh
