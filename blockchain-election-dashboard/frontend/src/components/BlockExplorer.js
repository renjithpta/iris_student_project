
import React,{useState,useEffect, use} from "react";
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
export default function BlockExplorer() {

  //const [blockNumber, setBlockNumber] = useState("");
  const [block, setBlock] = useState(null);
  const { blockNumber } = useParams();
  const [inputBlockNumber, setInputBlockNumber] = useState(blockNumber || "");
   const navigate = useNavigate();
const setBlockNumber = function (num){
    console.log("Setting block number to:", num);
   setInputBlockNumber
}   
useEffect(()=>{
    console.log("Received block number from URL:", inputBlockNumber);
    //setBlockNumber(blockNumber);
    loadBlock()
});

 const backHome = async () => {
   navigate("/");
  };
  const loadBlock = async () => {

    const res = await fetch(
      "http://145.239.29.94:5000/api/block/" + inputBlockNumber
    );

    const data = await res.json();

    setBlock(data);
  };

  return (

    <div style={{ padding: "30px" }}>

      <h2>Blockchain Block Explorer</h2>

      <input
        placeholder="Enter Block Number"
        value={inputBlockNumber}
        onChange={(e) => setBlockNumber(e.target.value)}
      />

      <button onClick={loadBlock}>
        Load Block
      </button>

       <button onClick={backHome} style={{ marginLeft: '4px' }}>
          Back to Dashboard 
      </button>



      {block && (

        <div style={{ marginTop: "30px" }}>

          <h3>Block #{block.blockNumber}</h3>

          <p><b>Previous Hash:</b> {block.previousHash}</p>
          <p><b>Data Hash:</b> {block.dataHash}</p>
          <p><b>Transactions:</b> {block.txCount}</p>

          <table border="1" cellPadding="10">

            <thead>
              <tr>
                <th>TxID</th>
    
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>

              {block.transactions.map((tx, i) => (

                <tr key={i}>
                  <td>{tx.txId}</td>
           
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}