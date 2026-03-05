import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OfficialDashboard() {

  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalVotersParticipated, setTotalVotersParticipated] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {

    try {
      setLoading(true);

      // 1️⃣ Get Active Election
      const activeRes = await api.get("/electiondata/getEActiveElectionDetails");

      if (!activeRes.data) {
        setElection(null);
        setLoading(false);
        return;
      }

     

      if(activeRes.data){

      setElection(activeRes.data.data.election);
      setCandidates(activeRes.data.data.candidates);
      console.log("======",activeRes.data);
      setTotalVotersParticipated(activeRes.data.data.statistics.totalVotersParticipated);
      setTotalVotes(activeRes.data.data.statistics.totalVotesCast);
      }

    } catch (err) {
      console.error(err);
      setElection(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="p-10 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black">
          Election Official Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={()=>navigate("/official/create-election")}
            className="bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create Election
          </button>

          <button
            onClick={()=>navigate("/official/voter-list")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            View Voters
          </button>

        
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (

        <>
          {/* NO ACTIVE ELECTION */}
          {!election && (
            <div className="bg-yellow-100 p-6 rounded-2xl text-center font-semibold">
              No Active Election.
              <div className="mt-4">
                <button
                  onClick={()=>navigate("/official/create-election")}
                  className="bg-blue-700 text-white px-6 py-3 rounded"
                >
                  Create New Election
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE ELECTION */}
          {election && (
            <>
              <div className="bg-white p-6 rounded-3xl shadow mb-8">

                <div className="flex justify-between items-center">

                  <div>
                    <h2 className="text-2xl font-black">
                      {election.title}
                    </h2>

                    <p className="text-gray-600">
                      Date: {new Date(election.electionDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-green-100 px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
                    <span className="font-semibold text-green-700">
                      Polling Live
                    </span>
                  </div>

                </div>

                <div className="mt-6 text-lg font-semibold">
                  Total Votes Cast: {totalVotes}
                </div>

              </div>

              {/* CANDIDATE LIST */}
              <div className="grid md:grid-cols-3 gap-6">

                {candidates.map((c) => {

                  const percentage =
                    totalVotes > 0
                      ? ((c.totalVote / totalVotes) * 100).toFixed(1)
                      : 0;

                  return (
                    <div
                      key={c.id}
                      className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition"
                    >

                      <h3 className="text-xl font-bold mb-2">
                        {c.full_name}
                      </h3>

                      <p className="text-gray-600 mb-3">
                        {c.party}
                      </p>

                      <div className="text-lg font-bold mb-2">
                        Votes: {c.votes}
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <div className="text-right text-sm mt-1 text-gray-600">
                        {percentage}%
                      </div>

                    </div>
                  );
                })}

              </div>

              {/* REFRESH BUTTON */}
              <div className="mt-8 text-center">
                <button
                  onClick={fetchDashboard}
                  className="bg-gray-700 text-white px-6 py-3 rounded"
                >
                  Refresh Dashboard
                </button>
              </div>

            </>
          )}
        </>
      )}

    </div>
  );
}