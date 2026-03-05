const { Client, BlockDecoder } = require("fabric-common");
const fs = require("fs");
const path = require("path");

async function getAllTransactions() {

  const ccpPath = path.resolve(__dirname,"fabric","connection-org1.json");
  const ccp = JSON.parse(fs.readFileSync(ccpPath,"utf8"));

  const client = Client.newClient("election-client");

  const channelName = "irischannel";

  const channel = client.newChannel(channelName);

  // get peer from connection profile
  const peerName = Object.keys(ccp.peers)[0];

const peerUrl = ccp.peers[peerName].url;

if (!peerUrl) {
  throw new Error("Peer URL not found in connection profile");
}

const peer = client.newEndorser(peerName);

await peer.connect(peerUrl);

  channel.addEndorser(peer);

  // query blockchain info
  const info = await channel.queryInfo(peer);

  const height = info.height.low;

  let transactions = [];

  for (let i = 0; i < height; i++) {

    const blockBuffer = await channel.queryBlock(i, peer);

    const block = BlockDecoder.decode(blockBuffer);

    const txs = block.data.data;

    txs.forEach(tx => {

      const txId =
        tx.payload.header.channel_header.tx_id;

      const timestamp =
        tx.payload.header.channel_header.timestamp;

      transactions.push({
        blockNumber: i,
        txId,
        timestamp
      });

    });

  }

  return transactions;
}

module.exports = { getAllTransactions };