import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function VoterList() {

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const res = await api.get("/voters/getAllVoters");
      setVoters(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = voters.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.voterId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          Registered Voters
        </h1>

        <button
          onClick={()=>navigate("/official")}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          ← Back
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name or Voter ID"
        className="border p-3 rounded w-full mb-6"
        onChange={(e)=>setSearch(e.target.value)}
      />

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (

        <div className="grid md:grid-cols-3 gap-6">

          {filtered.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl shadow-lg p-6 border hover:shadow-xl transition"
            >

              <img
                src={`http://localhost:4000/uploads/${v.voterId + "-"+v.imageName}`}
                alt="voter"
                className="h-40 w-full object-cover rounded-2xl mb-4"
              />

              <h3 className="text-xl font-bold mb-1">
                {v.name}
              </h3>

              <p className="text-gray-600 mb-2">
                {v.constituency}
              </p>

              <div className="font-mono text-lg border px-3 py-1 inline-block mb-2">
                {v.voterId}
              </div>

              <div className={`mt-2 font-semibold ${
                v.hasVoted ? "text-green-600" : "text-red-600"
              }`}>
                {v.hasVoted ? "Voted" : "Not Voted"}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}