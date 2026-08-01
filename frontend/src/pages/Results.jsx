import { useEffect, useState } from 'react';
import api from '../api/axios';
import ScoreBoard from '../components/ScoreBoard';

function teamLabel(team) {
  return team?.players?.join(' / ') || '—';
}

export default function Results() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/matches?status=finished');
        setMatches(data.matches);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-shuttle mb-6">Results</h1>
      {loading ? (
        <p className="text-courtline/40">Loading results...</p>
      ) : matches.length === 0 ? (
        <p className="text-courtline/40 card p-8 text-center">No completed matches yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matches.map((m) => (
            <div key={m._id} className="card p-4">
              <ScoreBoard match={m} />
              <p className="text-xs text-courtline/40 text-center mt-2">
                Winner:{' '}
                <span className={m.winner === 'teamA' ? 'text-teamA' : 'text-teamB'}>
                  {m.winner === 'teamA' ? teamLabel(m.teamA) : teamLabel(m.teamB)}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
