import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function VoterBooth() {

  const navigate = useNavigate();

  const [voterId, setVoterId] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [electionId, setElectionId] = useState("");
  const [candidateId, setCandidateId] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!voterId || !photo) {
      setMessage("Please enter Voter ID and upload photo.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("voterId", voterId);
      formData.append("photo", photo);

      const res = await api.post("/votes/verify", formData);

      // Save voter details in session
      sessionStorage.setItem(
        "verifiedVoter",
        JSON.stringify(res.data)
      );

      // Move to ballot page
      navigate("/booth/ballot");

    } catch (err) {

      const errorMsg =
        err.response?.data?.message || "Invalid voter";

      setMessage(errorMsg);

      // Redirect to landing after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-black mb-6 text-center">
          Enter Voting Booth
        </h1>

        <form onSubmit={handleVerify} className="space-y-4">

          <input
            type="text"
            placeholder="Enter Voter ID"
            className="border p-3 rounded w-full"
            value={voterId}
            onChange={(e)=>setVoterId(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="border p-3 rounded w-full"
            onChange={(e)=>setPhoto(e.target.files[0])}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded text-white flex items-center justify-center gap-2 transition
              ${loading 
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"}
            `}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

        </form>

        {message && (
          <div className="mt-4 text-center text-red-600 font-semibold">
            {message}
            <div className="text-sm mt-1">
              Redirecting to Home...
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={()=>navigate("/")}
            className="text-gray-600 hover:underline"
          >
            Back to Home
          </button>
        </div>

      </div>

    </div>
  );
}