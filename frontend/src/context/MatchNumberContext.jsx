import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const MatchNumberContext = createContext({ getMatchNumber: () => null });

// Display-only: fetches all matches, sorts by creation time, and maps
// _id -> sequential number (Match #1, #2, ...). Nothing is saved to the database.
export function MatchNumberProvider({ children }) {
  const [numberMap, setNumberMap] = useState({});

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/matches');
      const sorted = [...data.matches].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      const map = {};
      sorted.forEach((m, i) => {
        map[m._id] = i + 1;
      });
      setNumberMap(map);
    } catch {
      // silent - never block the page over this
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  const getMatchNumber = (matchId) => numberMap[matchId] ?? null;

  return (
    <MatchNumberContext.Provider value={{ getMatchNumber, refresh }}>
      {children}
    </MatchNumberContext.Provider>
  );
}

export const useMatchNumbers = () => useContext(MatchNumberContext);