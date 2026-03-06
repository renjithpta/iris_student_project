import React,{useState,useEffect} from "react";
import socket from "./socket";

import VoteChart from "./components/VoteChart";
import TxFeed from "./components/TxFeed";
import StatsPanel from "./components/StatsPanel";
import axios from "axios";
import BlockExplorer from "./components/BlockExplorer";
import { useNavigate } from "react-router-dom";
export default function Dashboard(){

 const [results,setResults] = useState({});
 const [txFeed,setTxFeed] = useState([]);
 const [totalVotes,setTotalVotes] = useState(0);

useEffect(()=>{

   async function loadHistory(){

   const res = await axios.get(
     "http://localhost:5000/api/transactions"
   );
   setTotalVotes(res.data.length);
   setTxFeed(res.data.reverse());
   


 }
 loadHistory();

  socket.on("newVote",(vote)=>{

    console.log("Vote received:",vote);
    if(vote.eventName === "VoteCast"){
    setResults(prev=>{
      const updated={
        ...prev,
        [vote.candidate]:(prev[vote.candidate]||0)+1
      };

      return updated;
    });
  }

  loadHistory();

  });

},[]);

 return(

 <div style={{padding:"30px"}}>

   <h1>🗳 Blockchain Election Command Center</h1>

   <StatsPanel totalVotes={totalVotes}/>

   <VoteChart results={results}/>

   <TxFeed txFeed={txFeed}/>

 </div>

 );

}