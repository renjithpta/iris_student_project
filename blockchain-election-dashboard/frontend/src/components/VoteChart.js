import React from "react";
import { Bar } from "react-chartjs-2";
import {
 Chart,
 BarElement,
 CategoryScale,
 LinearScale
} from "chart.js";

Chart.register(BarElement,CategoryScale,LinearScale);

export default function VoteChart({results}){

 const labels = Object.keys(results);
 const values = Object.values(results);

 const data = {
   labels,
   datasets:[
     {
       label:"Votes",
       data:values
     }
   ]
 };

 return(

 <div style={{width:"600px",marginTop:"40px"}}>
   <h2>Live Vote Count</h2>
   <Bar data={data}/>
 </div>

 );

}