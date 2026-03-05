
import { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [voters, setVoters] = useState([]);
  const [election, setElection] = useState({ title: "", candidates: [] });

  const registerVoter = (voter) => {
    setVoters([...voters, voter]);
  };

  const createElection = (title, candidates) => {
    setElection({ title, candidates: candidates.map(c => ({...c, votes:0})) });
  };

  const castVote = (index) => {
    const updated = [...election.candidates];
    updated[index].votes++;
    setElection({ ...election, candidates: updated });
  };

  return (
    <DataContext.Provider value={{
      voters,
      election,
      registerVoter,
      createElection,
      castVote
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
