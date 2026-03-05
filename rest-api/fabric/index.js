const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const debug = require('debug')('app:fabric');

const { organizations, channel } = require('../config').fabric;

class Fabric {
  constructor() {
    debug('-------------creating new fabric instance------------------');

    // create a map containing all available organizations
    this.orgs = new Map();
    Object.entries(organizations).forEach(([key, value]) => {
      // load org connection profile
      console.log("Fabric:: Key ,value",key,value);
      const ccpPath = path.resolve(__dirname, 'secure', value.connectionProfile);
      const fileExists = fs.existsSync(ccpPath);
      if (!fileExists) throw new Error(`no such file or directory: ${ccpPath}`);
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
      // Create a new CA client for interacting with the CA.
      const { url, caName } = ccp.certificateAuthorities[value.caIdentifier.trim()];
      const ca = new FabricCAServices({ url, caName });

      // store org connection profile and ca for future use

      this.orgs.set(key, { ccp, ca });

      // setup in memory wallet for fabric class and enroll admin
      // the following code will keep executing in the background even if a new instance is returned
      // this means if you use this instance right after initialization it will not work
      Wallets.newInMemoryWallet().then(async (wallet) => {
        this.wallet = wallet;

        // enrol admin identity for each org
        const enrollment = await ca.enroll({
          enrollmentID: value.admin,
          enrollmentSecret: value.adminPassword,
        });

        const adminIdentity = {
          credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
          },
          mspId: value.mspId,
          type: 'X.509',
        };
        await this.wallet.put(value.adminWalletId, adminIdentity);

        // build an admin object for authenticating with the CA
        // for future registration of users identities
        const provider = this.wallet.getProviderRegistry().getProvider('X.509');
        const adminRegistrar = await provider.getUserContext(adminIdentity, value.adminWalletId);
        console.log("========================key=========================",key.trim());
        this.orgs.set(key.trim(), { ccp, ca, adminRegistrar });
        debug(`admin identity enrolled and imported for org: ${key}`);
      });
    });

    /** connection map for storing different user's connections */
    this.connections = new Map();
  }

  /**
   * register new users using the ca service and import them to the wallet
   * @param {String} username
   * @param {string} password
   */
  async registerUser(username, password, org) {
    if (!this.orgs.has(org)) {
      throw new Error(`no such org: ${org} found with this fabric instance`);
    }

    // get organization static config
    const config = organizations[org];

    // get organization generated on init data
    const orgData = this.orgs.get(org);
    const { ca, adminRegistrar } = orgData;

    try {
      // register new identity
      await ca.register({
        affiliation: config.affiliation,
        enrollmentID: username,
        attrs: config.attrs,
        role: 'client',
        enrollmentSecret: password,
        maxEnrollments: -1, // set to -1 for infinite number of enrollments
      }, adminRegistrar );
 console.log("========================registerUser=========================",username.trim(),org);

      return { data: true };
    } catch (error) {
      return {
        message: 'error registering identity to CA',
        error,
      };
    }
  }

  /**
   * This method removes an already registered user from the CA.
   * It also removes the user identity from the wallet.
   *
   * please not that identity deletion must be enables in fabric-ca-server config
   * - FABRIC_CA_SERVER_CFG_IDENTITIES_ALLOWREMOVE=true
   * @param {string} username
   * @param {string} org
   */
  async deleteUser(username, org) {
    if (!this.orgs.has(org)) {
      throw new Error(`no such org: ${org} found with this fabric instance`);
    }

    // get organization generated on init data
    const orgData = this.orgs.get(org);
    const { ca, adminRegistrar } = orgData;

    try {
      // remove identity from wallet
      await this.wallet.remove(username);

      // create new identity service to delete given identity
      const identityService = ca.newIdentityService();
      await identityService.delete(username, adminRegistrar);

      return { data: true };
    } catch (error) {
      return {
        message: 'error deleting identity from CA',
        error,
      };
    }
  }

  /**
   * enroll registered users and import them to the wallet
   * @param {String} username
   * @param {string} password
   */
  async enrollUser(username, password, org) {
console.log("==start enrollment ===");
    if (!this.orgs.has(org)) {
      throw new Error(`no such org: ${org} found with this fabric instance`);
    }

    // get organization static config
    const config = organizations[org];


    // get organization generated on init data
    const orgData = this.orgs.get(org);
    const { ca } = orgData;

    try {
      // enroll registered identity
      const enrollment = await ca.enroll({
        enrollmentID: username,
        enrollmentSecret: password,
      });

      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: config.mspId,
        type: 'X.509',
      };

      // import enrolled identity to wallet
      await this.wallet.put(username, x509Identity);

      return { data: true };
    } catch (error) {
console.log(error);
      return {
        message: 'error enrolling and importing user',
        error,
      };
    }
  }

  /**
   * create a new connection gateway for this user and add it to connection map for future use.
   * this method will check whether or not the user already has a connection gateway.
   * This method reconnects the gateway on every trial for simplicity.
   */
  async connect(username, org) {

    console.error ("=============start connection =================",username,org);
    if (!this.orgs.has(org)) {
      throw new Error(`no such org: ${org} found with this fabric instance`);
    }
   console.error ("=============start connection =================",username,org);
    // get organization generated on init data
    const orgData = this.orgs.get(org);
    const { ccp } = orgData;

    // check if connection already exists
    let gateway;
    console.log("Fabric::connect username, org",this.connections);
    if (this.connections.has(username)) {
      // get gateway object if already exists
      console.log("Fabric::connect inside",username, org);
      gateway = this.connections.get(username);
    } else {
      // create new connection for user if not exists.
      gateway = new Gateway();
      this.connections.set(username, gateway);
    }
    //  console.log("gateway",gateway);
    try {

console.log("Fabric::connect username,gateway org",username, org);
      // for this connection to work the user identity must be imported to the wallet
      await gateway.connect(ccp, {
        wallet: this.wallet,
        identity: username,
        discovery: { enabled: true },
      });
      console.log("Fabric::connect username,gateway after",username, org);
      return { data: true };
    } catch (error) {
      return {
        message: 'error connecting gateway to network',
        error,
      };
    }
  }

  async getChaincode(username, chaincode, collectionNames = []) {
    console.log("getChaincode username, chaincode, collectionNames",username, chaincode, collectionNames);
    if (!this.connections.has(username.trim())) {
      return {
        error: new Error('user gateway connection not found'),
        message: 'user gateway connection not found',
      };
    }

    const gateway = this.connections.get(username);
    const network = await gateway.getNetwork(channel);
    const contract = network.getContract(chaincode);
    // we throw an error if chaincode not found because its more likely a developer error
    if (!contract) throw new Error(`chaincode:${chaincode} not found`);

    // add discovery interest if collections present
    contract.addDiscoveryInterest({ name: chaincode, collectionNames });

    return { contract };
  }

  async getNetwork(username) {
    
    const gateway = this.connections.get(username);
    const network = await gateway.getNetwork(channel);
    return network;
  }


  /**
   * submit transaction using entered username connection.
   * this method assumes an already established connection.
   * @param {string} username
   * @param {string} chaincode
   * @param {string} txName
   * @param {Array} args
   */
  async submitTx(username, chaincode, txName, args, collectionNames = []) {
    const {
      error, message, contract,
    } = await this.getChaincode(username, chaincode, collectionNames);

    if (error) return { error, message };

    try {
      const result = await contract.submitTransaction(txName, ...args);
      return result ;

    } catch (submitError) {
      return submitError;
    }
  }
   /**
   * submit transaction with private data using entered username connection.
   * this method assumes an already established connection.
   * @param {string} username
   * @param {string} chaincode
   * @param {string} txName
   * @param {Array} args
   * @param {privateData} privateData

   */
  async submitTxWithPrivateData(username, chaincode, txName, args, collectionNames = [],privateData) {
    const {
      error, message, contract,
    } = await this.getChaincode(username, chaincode, collectionNames);

    if (error) return { error, message };

    try {
      const transientDataBuffer = {}
      transientDataBuffer["price"] = Buffer.from(JSON.stringify(privateData))
      //const result = await contract.submitTransaction(txName, ...args);
      const result =await    contract.createTransaction(txName)
                .setTransient(transientDataBuffer)
                .submit(...args)
      return result ;
    } catch (submitError) {
      return submitError;
    }
  }


  /**
   * evaluate transaction using entered username connection.
   * this method assumes an already established connection.
   * @param {string} username
   * @param {string} chaincode
   * @param {string} txName
   * @param {Array} args
   */
  async evaluateTx(username, chaincode, txName, args) {
    const { error, message, contract } = await this.getChaincode(username, chaincode);
    if (error) return { error, message };

    try {
      const result = await contract.evaluateTransaction(txName, ...args);

      return result ;
    } catch (evaluateError) {


      return {
        message: 'evaluate transaction failed',
        error: evaluateError,
      };
    }
  }
}

module.exports = {
  Fabric: new Fabric(),
};
