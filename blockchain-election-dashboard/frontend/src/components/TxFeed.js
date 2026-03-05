import React, { useState } from "react";

export default function TxFeed({ txFeed }) {

  const [selectedTx, setSelectedTx] = useState(null);

  const showDetails = async (txId) => {

    try {

      const res = await fetch(
        "http://145.239.29.94:5000/api/transaction/" + txId
      );


      const data = await res.json();
      console.log("Transaction details:", data);

      setSelectedTx(data);

    } catch (err) {
      console.error("Error fetching transaction details:", err);
    }
  };

  return (

    <div style={{ marginTop: "40px" }}>

      <h2>Live Blockchain Transactions</h2>

      <table border="1" cellPadding="10">

        <thead>
          <tr>
            <th>Block</th>
            <th>Transaction</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>

          {txFeed.map((tx, i) => (
            <tr key={i}>
              <td>{tx.blockNumber}</td>

              <td>
                <button onClick={() => showDetails(tx.txId)}>
                  {tx.txId.substring(0, 12)}...
                </button>
              </td>

              <td>
                {new Date(tx.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}

        </tbody>

      </table>


      {/* Transaction Details Panel */}

      {selectedTx && (

        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            background: "#f9f9f9"
          }}
        >

          <h3>Transaction Details</h3>

          <p><b>TxID:</b> {selectedTx.txId}</p>

          <p><b>Chaincode:</b> {selectedTx.chaincode}</p>

          <p><b>Function:</b> {selectedTx.function}</p>

          <p>
            <b>Arguments:</b>{" "}
            {selectedTx.arguments &&
              selectedTx.arguments.join(", ")
            }
          </p>

          <p><b>Timestamp:</b> {selectedTx.timestamp}</p>

      

        </div>

      )}

    </div>

  );
}