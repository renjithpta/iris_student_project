const router = require("express").Router();
const { Gateway, Wallets } = require("fabric-network");
const { BlockDecoder } = require("fabric-common");
const fs = require("fs");
const path = require("path");

router.get("/:txid", async (req, res) => {
  try {

    const txId = req.params.txid;

    const ccpPath = path.resolve(__dirname, "../fabric/connection-org1.json");
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    const walletPath = path.join(__dirname, "../fabric/wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: "appUser",
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork("irischannel");

    const contract = network.getContract("qscc");

    const txBuffer = await contract.evaluateTransaction(
      "GetTransactionByID",
      "irischannel",
      txId
    );


const decoded = BlockDecoder.decodeTransaction(txBuffer);

const payload = decoded.transactionEnvelope.payload;

const header = payload.header.channel_header;

const action =
  payload.data.actions[0].payload.chaincode_proposal_payload
  .input.chaincode_spec.input;

const chaincode =
  payload.data.actions[0].payload.chaincode_proposal_payload
  .input.chaincode_spec.chaincode_id.name;

const args = action.args.map(a => Buffer.from(a).toString());

const result = {
  txId: header.tx_id,
  channel: header.channel_id,
  timestamp: header.timestamp,
  chaincode: chaincode,
  function: args[0],
  arguments: args.slice(1)
};

  

    await gateway.disconnect();

    res.json(result);

  } catch (err) {

    console.error("Transaction query error:", err);

    res.status(500).json({
      error: err.message
    });

  }
});

module.exports = router;