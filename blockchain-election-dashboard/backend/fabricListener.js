const { Gateway, Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");

let transactions = [];

async function listenFabricEvents(io){

 const ccpPath = path.resolve(
   __dirname,
   "fabric",
   "connection-org1.json"
 );

 const ccp = JSON.parse(fs.readFileSync(ccpPath,"utf8"));

 const walletPath = path.join(__dirname,"fabric","wallet");
 const wallet = await Wallets.newFileSystemWallet(walletPath);

 const gateway = new Gateway();

 await gateway.connect(ccp,{
   wallet,
   identity:"appUser",
   discovery:{enabled:true,asLocalhost:true}
 });

 console.log("✅ Connected to Fabric Gateway");

 const network = await gateway.getNetwork("irischannel");

 console.log("✅ Connected to channel irischannel");

 const listener = async(event)=>{

   const blockNumber = event.blockNumber.toString();

   for(const tx of event.blockData.data.data){

     const txId =
       tx.payload.header.channel_header.tx_id;
  const timestamp = new Date(
       tx.payload.header.channel_header.timestamp
    ).toISOString();
    

     const record = {
       blockNumber,
       txId,
       timestamp,
       eventName: event.eventName ,
       candidateId: event.payload?.candidateId

     };

     transactions.push(record);

     io.emit("newVote",record);

     console.log("📦 Block:",blockNumber,"TX:",txId);
   }

 };

 // ⭐ replay ALL blocks from beginning
 await network.addBlockListener(listener,{
   startBlock:0
 });

 console.log("📡 Replaying blockchain from block 0...");
}

function getTransactions(){
 return transactions;
}

module.exports = {
 listenFabricEvents,
 getTransactions
};