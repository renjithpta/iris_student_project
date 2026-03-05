const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

const envFound = dotenv.config();
if (!envFound) {
  throw new Error(' Couldn\'t find .env file!');
}

module.exports = {
  port: 4000,
  api: {
    prefix: '/',
  },
  couchdb: {
    url: process.env.COUCHDB_URL,
  },
  fabric: {
    channel: 'irischannel',
    organizations: {
      org1: {
        admin: process.env.ORG1_FABRIC_ADMIN,
        adminWalletId: 'org1admin',
        adminPassword: process.env.ORG1_FABRIC_ADMIN_PASSWORD,
        connectionProfile: 'connection-org1.json',
        caIdentifier: 'ca.org1.irisauth.com',
        mspId: 'Org1MSP',
        affiliation: 'org1.department1',
        attrs: [],
      },
      org2: {
        admin: process.env.ORG2_FABRIC_ADMIN,
        adminWalletId: 'org2admin',
        adminPassword: process.env.ORG2_FABRIC_ADMIN_PASSWORD,
        connectionProfile: 'connection-org2.json',
        caIdentifier: 'ca.org2.irisauth.com',
        mspId: 'Org2MSP',
        affiliation: 'org2.department1',
        attrs: [],
      }

    },
    collections: {
      stageOne: 'stageOne',
      stageTwo: 'stageTwo',
    },
  },
   
  apiKeys: {
    
    'Org1' : process.env.ORG1APIKEY || 'org1iotkey',
    'Org2' : process.env.ORG2APIKEY || 'org2iotkey'
    
    
   },
  serverUrl: process.env.SERVER_URL,
  // generate new jwt keys on server restart as the InMemoryWallet will lose
  // its data on restart and users will need to re-enroll their identity in the wallet
  jwtSecret: process.env.JWT_SECRET || "renjith",
  roles: {
    org1: 'org1',
    org2: 'org2',
   
    Org1: 'Org1',
    Org2: 'Org2'
   
  },
  contracts: {
    irisdatastorecontract: 'irisdatastorecontract',
  },
  pagination: {
    pageSize: 20,
  },
};
