import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function VoterRegister() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    constituency: "",
    address: ""
  });

  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo) {
      setMessage("Please upload a photo");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const formData = new FormData();
      formData.append("name", form.full_name);
      formData.append("constituency", form.constituency);
      formData.append("address", form.address);
      formData.append("file", photo);
      const res = await api.post("/voters/register", formData);
      setMessage(res.data.message);
      alert("Generated Voter ID: " + res.data.data.voterId);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-xl">

      <h1 className="text-3xl font-black mb-6">
        Register Voter
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          className="border p-3 rounded w-full"
          required
          onChange={(e)=>setForm({...form, full_name:e.target.value})}
        />

        <input
          type="text"
          placeholder="Constituency"
          className="border p-3 rounded w-full"
          required
          onChange={(e)=>setForm({...form, constituency:e.target.value})}
        />
          <input
          type="text"
          placeholder="Address"
          className="border p-3 rounded w-full"
          required
          onChange={(e)=>setForm({...form, address:e.target.value})}
        />

        <input
          type="file"
          accept="image/*"
          className="border p-3 rounded w-full"
          required
          onChange={(e)=>setPhoto(e.target.files[0])}
        />

        <div className="flex gap-4 mt-6">

          {/* REGISTER BUTTON WITH SPINNER */}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded text-white flex items-center justify-center gap-2
              ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}
            `}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Registering..." : "Register"}
          </button>

          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={()=>navigate(-1)}
            className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
            disabled={loading}
          >
            Back
          </button>

          {/* CANCEL BUTTON */}
          <button
            type="button"
            onClick={()=>navigate("/official")}
            className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700"
            disabled={loading}
          >
            Cancel
          </button>

        </div>

      </form>

      {message && (
        <div className={`mt-4 font-semibold ${
          message.includes("Successfully") || message.toLowerCase().indexOf("success") >= 0? "text-green-600" : "text-red-600"
        }`}>
          {message}
        </div>
      )}

    </div>
  );
}