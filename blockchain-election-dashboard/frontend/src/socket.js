import { io } from "socket.io-client";

const socket = io("http://145.239.29.94:5000");
socket.on("connect",()=>{
  console.log("Connected to backend socket");
});

export default socket;