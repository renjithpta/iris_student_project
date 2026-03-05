import { useState } from "react";
import { useData } from "../context/DataContext";
import PageLayout from "../components/PageLayout";

export default function CreateElection() {
  const { createElection } = useData();

  const [title, setTitle] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const addCandidate = () => {
    if (!name) return;

    setCandidates([
      ...candidates,
      { name, party, photo: preview }
    ]);

    setName("");
    setParty("");
    setPhoto(null);
    setPreview(null);
  };

  const saveElection = () => {
    createElection(title, candidates);
    alert("Election Created Successfully");
  };

  return (
    <PageLayout title="Create Election">

      <div className="space-y-6">

        <div>
          <label className="block font-semibold mb-2">
            Election Title
          </label>
          <input
            className="w-full border p-4 rounded-xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <hr />

        <h2 className="text-2xl font-bold">
          Register Candidate
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block font-semibold mb-2">
              Candidate Name
            </label>
            <input
              className="w-full border p-4 rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Party Name
            </label>
            <input
              className="w-full border p-4 rounded-xl"
              value={party}
              onChange={(e) => setParty(e.target.value)}
            />
          </div>

        </div>

        <div>
          <label className="block font-semibold mb-2">
            Upload Candidate Photo
          </label>

          <div className="border-2 border-dashed rounded-3xl p-6 text-center">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-40 mx-auto rounded-2xl"
              />
            ) : (
              <p className="text-gray-500">
                Upload Portrait Image
              </p>
            )}

            <input
              type="file"
              className="mt-4"
              onChange={handlePhoto}
            />
          </div>
        </div>

        <button
          onClick={addCandidate}
          className="px-8 py-3 bg-green-600 text-white rounded-full font-bold shadow-lg hover:bg-green-700"
        >
          Add Candidate
        </button>

        <hr />

        <div className="grid md:grid-cols-3 gap-6">
          {candidates.map((c, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-3xl shadow">
              {c.photo && (
                <img
                  src={c.photo}
                  className="h-32 mx-auto rounded-2xl mb-4"
                />
              )}
              <h3 className="font-bold text-lg">{c.name}</h3>
              <p className="text-gray-600">{c.party}</p>
            </div>
          ))}
        </div>

        <button
          onClick={saveElection}
          className="px-10 py-4 bg-blue-700 text-white rounded-full font-black shadow-xl hover:bg-blue-800"
        >
          Finalize Election
        </button>

      </div>

    </PageLayout>
  );
}