import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

function teamLabel(team) {
  return team?.players?.join(' / ') || '—';
}

export default function Fixtures() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [scheduled, assigned] = await Promise.all([
          api.get('/matches?status=scheduled'),
          api.get('/matches?status=assigned'),
        ]);
        setMatches([...assigned.data.matches, ...scheduled.data.matches]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-shuttle mb-6">Fixtures</h1>
      {loading ? (
        <p className="text-courtline/40">Loading fixtures...</p>
      ) : matches.length === 0 ? (
        <p className="text-courtline/40 card p-8 text-center">No upcoming fixtures right now.</p>
      ) : (
        <div className="card divide-y divide-stadium-700">
          {matches.map((m) => (
            <div key={m._id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm">
                  <span className="text-teamA">{teamLabel(m.teamA)}</span>
                  <span className="text-courtline/40"> vs </span>
                  <span className="text-teamB">{teamLabel(m.teamB)}</span>
                </p>
                <p className="text-xs text-courtline/40 capitalize">
                  {m.type} {m.court ? `· Court ${m.court}` : ''}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
