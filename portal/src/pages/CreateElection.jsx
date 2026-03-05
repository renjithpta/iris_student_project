import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateElection() {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const [candidates, setCandidates] = useState([]);

  const [candidateName, setCandidateName] = useState("");
  const [party, setParty] = useState("");
  const [photo, setPhoto] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ---------------- Add Candidate ---------------- */

  const addCandidate = () => {

    if (!candidateName || !party || !photo) {
      setMessage("Please fill candidate name, party and upload photo.");
      return;
    }

    setCandidates([
      ...candidates,
      {
        full_name: candidateName,
        party,
        photo
      }
    ]);

    setCandidateName("");
    setParty("");
    setPhoto(null);
    setMessage("");
  };

  /* ---------------- Remove Candidate ---------------- */

  const removeCandidate = (index) => {
    const updated = [...candidates];
    updated.splice(index, 1);
    setCandidates(updated);
  };


  const createElectionWithCandidates = async (e) => {
    e.preventDefault();

 
    if (!title || !date || candidates.length === 0) {
      setMessage("Please fill election details and add at least one candidate.");
      return;
    }
  setLoading(true);
  try {

    const formData = new FormData();
    // Election Data
    formData.append("title", title);
    formData.append("electionDate", date);
    // Candidates JSON (without photo)
    const candidatesData = candidates.map(c => ({
      fullName: c.full_name,
      party: c.party
    }));

    formData.append("candidates", JSON.stringify(candidatesData));

    // Append photos separately (order matters)
    candidates.forEach((c) => {
      formData.append("photos", c.photo);
    });

    const res = await api.post("/electiondata/createElection", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    console.log("Election created:", res.data);
    setMessage( res.data.message);
  } catch (error) {
    alert("Failed to create election. error: " + error.response?.data?.message || error.message);
    console.error("Error:", error);
    return;
  }finally {
      setLoading(false);
    }
};

  /* ---------------- Submit Election ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !date || candidates.length === 0) {
      setMessage("Please fill election details and add at least one candidate.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // 1️⃣ Create Election
      const electionRes = await api.post("/elections/create", {
        title,
        election_date: date
      });

      const electionId = electionRes.data.data.id;

      // 2️⃣ Add Candidates
      for (let c of candidates) {
        const formData = new FormData();
        formData.append("election_id", electionId);
        formData.append("full_name", c.full_name);
        formData.append("party", c.party);
        formData.append("photo", c.photo);

        await api.post("/candidates/add", formData);
      }

      setMessage("Election Created Successfully!");

      setTimeout(() => {
        navigate("/official");
      }, 1500);

    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to create election"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-10 max-w-5xl mx-auto">

      {/* FULL SCREEN LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold">
              Processing Election...
            </span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          Create Election
        </h1>

        <button
          onClick={() => navigate("/official")}
          disabled={loading}
          className={`px-4 py-2 rounded text-white transition
            ${loading 
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-700 hover:bg-gray-800"}
          `}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={createElectionWithCandidates} className="space-y-8">

        {/* Election Details */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">

          <h2 className="text-xl font-bold mb-4">
            Election Details
          </h2>

          <input
            type="text"
            placeholder="Election Title"
            className="border p-3 rounded w-full"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />

          <input
            type="date"
            className="border p-3 rounded w-full"
            value={date}
            onChange={(e)=>setDate(e.target.value)}
          />
        </div>

        {/* Add Candidate Section */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow space-y-4">

          <h2 className="text-xl font-bold">
            Add Candidate
          </h2>

          <input
            type="text"
            placeholder="Candidate Name"
            className="border p-3 rounded w-full"
            value={candidateName}
            onChange={(e)=>setCandidateName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Party"
            className="border p-3 rounded w-full"
            value={party}
            onChange={(e)=>setParty(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="border p-3 rounded w-full"
            onChange={(e)=>setPhoto(e.target.files[0])}
          />

          <button
            type="button"
            onClick={addCandidate}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add Candidate
          </button>

        </div>

        {/* Candidate Preview */}
        {candidates.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {candidates.map((c, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow relative"
              >
                <img
                  src={URL.createObjectURL(c.photo)}
                  alt="preview"
                  className="h-32 w-full object-cover rounded mb-3"
                />

                <h3 className="font-bold text-lg">
                  {c.full_name}
                </h3>

                <p className="text-gray-600">
                  {c.party}
                </p>

                <button
                  type="button"
                  onClick={()=>removeCandidate(index)}
                  className="absolute top-2 right-2 text-red-600 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded text-white flex items-center gap-2 transition
            ${loading 
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-800"}
          `}
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Creating Election..." : "Create Election"}
        </button>

      </form>

      {/* MESSAGE */}
      {message && (
        <div className={`mt-6 font-semibold ${
          message.includes("success")
            ? "text-green-600"
            : "text-red-600"
        }`}>
          {message}
        </div>
      )}

    </div>
  );
}