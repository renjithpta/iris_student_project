import React from "react";

export default function StatsPanel({totalVotes}){

 return(

 <div style={{
   background:"white",
   padding:"20px",
   marginTop:"20px",
   width:"300px",
   boxShadow:"0px 0px 5px #ccc"
 }}>

 <h3>Total Blocks</h3>

 <h1>{totalVotes}</h1>

 </div>

 );

}