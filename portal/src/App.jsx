import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import OfficialLogin from "./pages/OfficialLogin";
import OfficialDashboard from "./pages/OfficialDashboard";
import VoterRegister from "./pages/VoterRegister";
import CreateElection from "./pages/CreateElection";
import ElectionDashboard from "./pages/ElectionDashboard";
import VoterList from "./pages/VoterList";
import Booth from "./pages/Booth";
import AdminLayout from "./components/PageLayout.jsx";

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("officialAuth");
  return isAuth ? children : <Navigate to="/official/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/official/login" element={<OfficialLogin />} />

        <Route
          path="/official"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OfficialDashboard />} />
          <Route path="register" element={<VoterRegister />} />
          <Route path="create-election" element={<CreateElection />} />

          <Route path="voter-list" element={<VoterList />} />
        </Route>

        <Route path="/booth" element={<Booth />} />

      </Routes>
    </BrowserRouter>
  );
}