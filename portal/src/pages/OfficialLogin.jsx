import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
export default function OfficialLogin() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const login = async (e) => {

  e.preventDefault();
  setLoading(true);
  setError(false);

  try {

    const res = await api.post("/auth/login", {
      username: form.username,
      password: form.password
    });

    if (!res.data || !res.data.data.token) {
      throw new Error("Invalid response from the server!");
    }
    localStorage.setItem("token", res.data.data.token);
    localStorage.setItem("officialAuth", "true");
    localStorage.setItem("userDetails", res.data.data.user);
    navigate("/official");

  } catch (err) {
     setError(true);
     setLoading(false);
      
  }
};

  /*const login = (e) => {
    e.preventDefault();

    setLoading(true);
    setError(false);

    setTimeout(() => {

      if (form.username === "admin" && form.password === "admin123") {
        localStorage.setItem("officialAuth", "true");
        navigate("/official");
      } else {
        setError(true);
        setLoading(false);
      }

    }, 1500); // simulate secure auth delay

  };*/

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ANIMATED GRADIENT BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-[length:200%_200%] animate-gradient"></div>

      {/* RADIAL LIGHT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]"></div>

      {/* WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <span className="text-[300px] font-black text-white tracking-widest">
          EC
        </span>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-white">

        {/* SECURITY ICON */}
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L4 6v6c0 5 3.8 9.7 8 10 4.2-.3 8-5 8-10V6l-8-4z" />
          </svg>
        </div>

        <h1 className="text-4xl font-black mb-4">
          Secure Official Access
        </h1>

        <p className="text-blue-200 mb-10">
          Authorized Election Officials Only
        </p>

        <form
          onSubmit={login}
          className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl w-full max-w-md transition ${
            error ? "animate-shake border-red-500" : ""
          }`}
        >

          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold">
              Username
            </label>
            <input
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter username"
              onChange={(e)=>setForm({...form, username:e.target.value})}
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-sm font-semibold">
              Password
            </label>
            <input
              type="password"
              className="w-full p-4 rounded-xl bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Enter password"
              onChange={(e)=>setForm({...form, password:e.target.value})}
            />
          </div>

          {error && (
            <div className="text-red-300 mb-4 text-sm">
              Invalid credentials. Please try again.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-900 py-4 rounded-full font-bold hover:bg-gray-200 transition flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></span>
                Authenticating...
              </>
            ) : (
              "Login to Control Panel →"
            )}
          </button>

        </form>

        <button
          onClick={()=>navigate("/")}
          className="mt-8 text-blue-200 hover:text-white transition"
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
}