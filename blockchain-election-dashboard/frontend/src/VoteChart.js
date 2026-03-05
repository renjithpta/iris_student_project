import React from "react";
import { Bar } from "react-chartjs-2";

export default function VoteChart({results}){

 const data={
   labels:Object.keys(results),
   datasets:[
     {
       label:"Votes",
       data:Object.values(results)
     }
   ]
 };

 return <Bar data={data}/>;

}