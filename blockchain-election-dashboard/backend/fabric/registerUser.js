const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function registerUser(){

 const ccpPath = path.resolve(__dirname,'connection-org1.json');
 const ccp = JSON.parse(fs.readFileSync(ccpPath,'utf8'));

 const caURL = ccp.certificateAuthorities['ca.org1.irisauth.com'].url;
 const ca = new FabricCAServices(caURL);

 const walletPath = path.join(__dirname,'wallet');
 const wallet = await Wallets.newFileSystemWallet(walletPath);

 const userIdentity = await wallet.get('appUser');

 if(userIdentity){
   console.log("User exists");
   return;
 }

 const adminIdentity = await wallet.get('admin');

 const gateway = new Gateway();

 await gateway.connect(ccp,{
   wallet,
   identity:'admin',
   discovery:{enabled:true,asLocalhost:true}
 });

 const caClient = ca;

 const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);

 const adminUser = await provider.getUserContext(adminIdentity,'admin');

 const secret = await caClient.register({
   affiliation:'org1.department1',
   enrollmentID:'appUser',
   role:'client'
 },adminUser);

 const enrollment = await caClient.enroll({
   enrollmentID:'appUser',
   enrollmentSecret:secret
 });

 const x509Identity={
   credentials:{
     certificate:enrollment.certificate,
     privateKey:enrollment.key.toBytes()
   },
   mspId:'Org1MSP',
   type:'X.509'
 };

 await wallet.put('appUser',x509Identity);

 console.log("User registered successfully");

}

registerUser();