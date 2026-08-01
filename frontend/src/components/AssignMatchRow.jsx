import { useState } from 'react';

function teamLabel(team) {
  return team?.players?.join(' / ') || '—';
}

export default function AssignMatchRow({ match, courts, onAssign }) {
  const [court, setCourt] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedCourt = courts.find((c) => c.number === Number(court));
  const slot = selectedCourt?.status === 'occupied' ? 'next' : 'current';

  const handleAssign = async () => {
    if (!court) return;
    setBusy(true);
    try {
      await onAssign(match._id, Number(court), slot);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-stadium-700 last:border-0">
      <div className="text-sm">
        <span className="text-teamA">{teamLabel(match.teamA)}</span>
        <span className="text-courtline/40"> vs </span>
        <span className="text-teamB">{teamLabel(match.teamB)}</span>
        <span className="text-courtline/30 ml-2 capitalize">({match.type})</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={court}
          onChange={(e) => setCourt(e.target.value)}
          className="input-field w-auto py-1 text-sm"
        >
          <option value="">Select court</option>
          {courts.map((c) => (
            <option key={c.number} value={c.number}>
              Court {c.number} {c.status === 'occupied' ? '(busy — queue as next)' : '(idle)'}
            </option>
          ))}
        </select>
        <button onClick={handleAssign} disabled={!court || busy} className="btn-primary py-1.5 text-xs">
          {busy ? '...' : slot === 'next' ? 'Queue Next' : 'Assign'}
        </button>
      </div>
    </div>
  );
}
