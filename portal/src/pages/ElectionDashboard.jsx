import { useData } from "../context/DataContext";

export default function ElectionDashboard() {
  const { election } = useData();

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-4xl font-black mb-8 text-gray-800">
        {election.title || "No Active Election"}
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {election.candidates.map((c, index) => (
          <div 
            key={index}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-2">
              {c.name}
            </h2>

            <div className="mt-4">
              <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-4"
                  style={{ width: `${c.votes * 10}%` }}
                />
              </div>
              <p className="mt-2 text-lg font-semibold">
                {c.votes} Votes
              </p>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}