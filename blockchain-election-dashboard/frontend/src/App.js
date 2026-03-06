import React from "react";
import Dashboard from "./Dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BlockExplorer from "./components/BlockExplorer";
function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/block/:blockNumber" element={<BlockExplorer />} />
        </Routes>
      </BrowserRouter>
    </div>
  );

}

export default App;