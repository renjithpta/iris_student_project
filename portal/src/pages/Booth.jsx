import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Booth() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [voterId, setVoterId] = useState("");
  const [photo, setPhoto] = useState(null);
  const [voter, setVoter] = useState(null);
  const  [voteTxId, setVoteTxId] = useState(null);
  const [election, setElection] = useState(null);
  const [electionId, setElectionId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    publicLogin();
  }, []);
const publicLogin = async (e) => {
   const res = await api.post("/auth/login", {
      username: "public",
      password: "public123"
    });

    if (!res.data || !res.data.data.token) {
      throw new Error("Invalid response from the server!");
    }
    localStorage.setItem("token", res.data.data.token);
    localStorage.setItem("officialAuth", "true");
    localStorage.setItem("userDetails", res.data.data.user);
}
  /* ---------------- VERIFY ---------------- */

  const verify = async (e) => {
    e.preventDefault();
    if (!voterId || !photo) return;
     let res = null;
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("voterId", voterId);
      formData.append("file", photo);

      res = await api.post("/voters/verifyVoter", formData);
      console.log("res ", res);
      setVoter(res.data.data);
      setVoterId(res.data.data.voterId);
      setStep(2);

     // fetchElection();

    } catch(error) {
      console.log("Status:", error.response.status);
    console.log("Message:", error.response.data.message);

  
      alert(error.response.data.message);
    
      //alert("Verification Failed. Please check your Voter ID and Photo." );
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH ELECTION ---------------- */

  const fetchElection = async () => {

//const res = await api.get("/votes/active");
    const activeRes = await api.get("/electiondata/getEActiveElectionDetails");

      if (!activeRes.data) {
        setElection(null);
        setLoading(false);
        return;
      }

    if (!activeRes.data || !activeRes.data.data.election) {
      alert("No Active Election Present.");
      navigate("/");
      return;
    }

    setElection(activeRes.data.data.election);
    setCandidates(activeRes.data.data.candidates);
    setElectionId(activeRes.data.data.election.electionId);
    setStep(3);
  };

  /* ---------------- CAST ---------------- */

  const cast = async () => {

    if (!selected) return;

    try {
      setLoading(true);

      const activeRes = await api.post("/electiondata/castVote", {
       electionId: electionId,
       candidateId:selected,
       voterId:voter.voterId
      });
      setVoteTxId(activeRes.data.data.resultJSON.txId);
      setStep(4);

    } catch {
      alert("You have already voted.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STEP COMPONENT ---------------- */

  const Stepper = () => {
    const steps = ["Verification", "Election", "Selection", "Confirmation"];

    return (
      <div className="flex items-center justify-between max-w-4xl mx-auto mb-14 relative">

        {steps.map((label, index) => {

          const active = step >= index + 1;

          return (
            <div key={index} className="flex-1 flex flex-col items-center relative">

              {index !== 0 && (
                <div
                  className={`absolute top-6 left-0 w-full h-1 -z-10
                    ${step > index ? "bg-green-400" : "bg-white/20"}
                  `}
                  style={{ transform: "translateX(-50%)" }}
                ></div>
              )}

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all
                  ${active
                    ? "bg-white text-blue-900 shadow-lg scale-110"
                    : "bg-white/30 text-white"}
                `}
              >
                {index + 1}
              </div>

              <span className={`mt-3 text-sm ${
                active ? "text-white" : "text-white/60"
              }`}>
                {label}
              </span>

            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* SAME GRADIENT AS LANDING */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700"></div>

      {/* RADIAL LIGHT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]"></div>

      {/* WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <span className="text-[300px] font-black text-white tracking-widest">
          EC
        </span>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 px-8 py-10 text-white">

        {/* TOP NAV */}
        <div className="flex justify-between items-center mb-16">

          <div>
            <h1 className="text-2xl font-black">
              Election Commission Portal
            </h1>
          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-white text-blue-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition"
          >
            ← Back to Home
          </button>

        </div>

        <Stepper />

        {/* MAIN CARD */}
        <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 p-12 rounded-3xl shadow-2xl">

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={verify} className="space-y-8 max-w-xl mx-auto">

              <h2 className="text-2xl font-bold text-center mb-8">
                Identity Verification
              </h2>

              <input
                type="text"
                placeholder="Enter Voter ID"
                className="w-full p-4 rounded-xl text-black"
                onChange={(e)=>setVoterId(e.target.value)}
              />

              <input
                type="file"
                className="w-full p-4 rounded-xl bg-white text-black"
                onChange={(e)=>setPhoto(e.target.files[0])}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-blue-900 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

            </form>
          )}

          {step === 2 && voter && (
  <div className="text-center space-y-6">

    <h2 className="text-2xl font-bold">
      Confirm Your Details
    </h2>

    <div className="bg-white text-blue-900 p-8 rounded-3xl shadow-xl max-w-lg mx-auto">

      <img
        src={`http://145.239.29.94:4000/uploads/${voter.voterId+'-'+voter.imageName}`}
        className="h-32 w-32 mx-auto rounded-full mb-6"
        alt=""
      />

      <h3 className="text-xl font-bold">
        {voter.name}
      </h3>

      <p className="mt-2">
        Constituency: {voter.constituency}
      </p>
     <p className="mt-2">
        Address: {voter.address}
      </p>
      <div className="mt-4 font-mono border px-4 py-2 inline-block">
        {voter.voterId}
      </div>

    </div>

    <button
      onClick={fetchElection}
      className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-xl font-bold"
    >
      Continue to Ballot
    </button>

  </div>
)}

          {/* STEP 3 */}
          {step === 3 && (
            <div>

              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold">
                  {election.title}
                </h2>
                <p className="text-blue-200 mt-2">
                  {new Date(election.electionDate).toLocaleDateString()}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">

                {candidates.map(c => (
                  <div
                    key={c.id}
                    onClick={()=>setSelected(c.candidateId)}
                    className={`bg-white text-blue-900 p-6 rounded-3xl shadow cursor-pointer transition transform
                      ${selected === c.candidateId
                        ? "ring-4 ring-yellow-400 scale-105"
                        : "hover:scale-105"}
                    `}
                  >
                    <img
                      src={`http://145.239.29.94:4000/uploads/${c.imagePath}`}
                      className="h-40 w-full object-cover rounded-xl mb-4"
                      alt=""
                    />
                    <h3 className="text-lg font-bold">
                      {c.name}
                    </h3>
                    <p>{c.party}</p>
                  </div>
                ))}

              </div>

              <div className="text-center mt-12">
                <button
                  onClick={cast}
                  disabled={loading}
                  className="bg-yellow-400 text-blue-900 px-10 py-4 rounded-xl font-bold hover:bg-yellow-300 transition"
                >
                  {loading ? "Submitting..." : "Cast Vote"}
                </button>
              </div>

            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="text-center mt-20">
              <div className="text-6s font-black mb-2 text-yellow-00">
                ✔ Vote Recorded with TxId: {voteTxId ? voteTxId : "N/A"}
              </div>
              <p className="text-blue-200">
                Thank you for strengthening democracy.
              </p>
              <button
                onClick={()=>navigate("/")}
                className="mt-8 bg-white text-blue-900 px-8 py-3 rounded-xl font-semibold"
              >
                Return Home
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}