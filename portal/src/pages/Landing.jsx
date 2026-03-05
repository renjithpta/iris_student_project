import { useNavigate } from "react-router-dom";

export default function Landing() {

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700"></div>

      {/* RADIAL LIGHT EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]"></div>

      {/* WATERMARK SEAL */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <span className="text-[300px] font-black text-white tracking-widest">
          EC
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-6">

        <h1 className="text-5xl md:text-6xl font-black mb-6 text-center leading-tight">
          National Digital Election Portal
        </h1>

        <p className="text-xl md:text-2xl text-blue-200 mb-16 text-center max-w-3xl">
          Secure • Transparent • Trusted Digital Voting Infrastructure
        </p>

        <div className="grid md:grid-cols-2 gap-10 w-full max-w-5xl">

          {/* OFFICIAL CARD */}
          <div
            onClick={() => navigate("/official/login")}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl cursor-pointer hover:scale-105 transition duration-300"
          >
            <h2 className="text-3xl font-bold mb-4">
              Election Official
            </h2>

            <p className="text-blue-200 mb-6">
              Manage voter registry, create elections, and monitor results securely.
            </p>

            <div className="bg-white text-blue-900 px-6 py-3 rounded-full font-bold inline-block">
              Access Control Panel →
            </div>
          </div>

          {/* VOTER CARD */}
          <div
            onClick={() => navigate("/booth")}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl cursor-pointer hover:scale-105 transition duration-300"
          >
            <h2 className="text-3xl font-bold mb-4">
              Enter Voting Booth
            </h2>

            <p className="text-blue-200 mb-6">
              Verify your identity and securely cast your vote in the active election.
            </p>

            <div className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold inline-block">
              Start Voting →
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="absolute bottom-6 text-blue-300 text-sm">
          © 2026 National Election Commission • Digital Voting System
        </div>

      </div>

    </div>
  );
}