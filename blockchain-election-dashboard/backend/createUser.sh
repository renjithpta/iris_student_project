npm i
rm -rf fabric/wallet/*
cp ../..//hlf-network/organizations/peerOrganizations/org1.irisauth.com/connection-org1.json  fabric/
node fabric/enrollAdmin.js
node fabric/registerUser.js
npm run dev
