const router = require("express").Router();
const { Gateway, Wallets } = require("fabric-network");
const { BlockDecoder } = require("fabric-common");
const fs = require("fs");
const path = require("path");

router.get("/:blockNumber", async (req,res)=>{

 try{

  const blockNumber = req.params.blockNumber;

  const ccpPath = path.resolve(
   __dirname,
   "../fabric/connection-org1.json"
  );

  const ccp = JSON.parse(fs.readFileSync(ccpPath,"utf8"));

  const walletPath = path.join(__dirname,"../fabric/wallet");

  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const gateway = new Gateway();

  await gateway.connect(ccp,{
   wallet,
   identity:"appUser",
   discovery:{enabled:true,asLocalhost:true}
  });

  const network = await gateway.getNetwork("irischannel");

  // query system chaincode
  const contract = network.getContract("qscc");

  const blockBuffer = await contract.evaluateTransaction(
   "GetBlockByNumber",
   "irischannel",
   blockNumber.toString()
  );

  const block = BlockDecoder.decode(blockBuffer);

  const header = block.header;

  const previousHash =
   Buffer.from(header.previous_hash).toString("hex");

  const dataHash =
   Buffer.from(header.data_hash).toString("hex");

  const txs = block.data.data;

  const transactions = txs.map(tx=>{

   const ch = tx.payload.header.channel_header;

   let candidate = "";

   try{

    const args =
     tx.payload.data.actions[0]
     .payload.chaincode_proposal_payload
     .input.chaincode_spec.input.args;

    candidate = Buffer.from(args[2]).toString();

   }catch(e){}

   return{
    txId: ch.tx_id,
    timestamp: ch.timestamp,
    candidate
   };

  });

  res.json({
   blockNumber,
   previousHash,
   dataHash,
   txCount: transactions.length,
   transactions
  });

  await gateway.disconnect();

 }catch(err){

  console.error(err);

  res.status(500).json({
   error:err.message
  });

 }

});

module.exports = router;