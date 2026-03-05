#!/bin/bash
set -e
sudo chmod -R +rwx .
# start network and create channel with certificate authorities
cd ./hlf-network 
./network.sh up createChannel -ca -s couchdb


docker ps

./network.sh deployCCAAS -ccn irisdatastorecontract -ccp ../chain-code/chaincode-typescript -ccl typescript


cp organizations/peerOrganizations/org1.irisauth.com/connection-org1.json ../rest-api/fabric/secure/
cp organizations/peerOrganizations/org2.irisauth.com/connection-org2.json ../rest-api/fabric/secure/




sudo chmod +rwx *
sudo cp -r organizations/   ../hlf-explorer/
sleep 1
cd  ../hlf-explorer
sudo chmod +rwx *
sudo chmod +rwx */**
sudo chmod +rwx */**/**
sudo chmod +rwx */**/**/**
sudo chmod +rwx */**/**/**/**
sudo chmod +rwx */**/**/**/**/**
sudo chmod +rwx */**/**/**/**/**/**
sudo chmod +rwx */**/**/**/**/**/**/**


echo "*************************************************"
echo "*************HLF exploreor part started**************"
echo "*************************************************"
sudo chmod -R +rwx .
cd organizations/peerOrganizations/org1.irisauth.com/users/User1@org1.irisauth.com/msp/keystore
NEW_NAME="priv_sk"
sudo chmod -R +rwx .
for file in *_sk
do
if [ "$file" != "$NEW_NAME" ]; then
 sudo mv "$file" "$NEW_NAME"
fi
done
cd ../../../Admin@org1.irisauth.com/msp/keystore
sudo chmod +rwx *
for file in *_sk
do
if [ "$file" != "$NEW_NAME" ]; then
 sudo mv "$file" "$NEW_NAME"
fi
done
cd ../../../../../../../
docker-compose up -d

cd ..
pushd rest-api
docker-compose up -d
sleep 12
pm2 start ecosystem.config.js
sleep 12
sh createUser.sh
pm2 logs --json
