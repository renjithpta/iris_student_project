const express = require("express");
const http = require("http");
const cors = require('cors');
const socketIo = require("socket.io");
const resultsRouter = require("./routes/results");
const { listenFabricEvents } = require("./fabricListener");

const app = express();
const server = http.createServer(app);
const txRoutes = require("./routes/transactions");
const txDetailsRoute = require("./routes/transactionDetails");
const blockDetails = require("./routes/blockDetails");



const io = socketIo(server,{
  cors:{origin:"*"}
});
app.use(cors());
app.use(express.json());
app.use("/api/results",resultsRouter);
app.use("/api/transactions",txRoutes);
app.use("/api/transaction", txDetailsRoute);
app.use("/api/block", blockDetails);
listenFabricEvents(io);

server.listen(5000,()=>{
  console.log("Election dashboard backend running on 4000");
});
