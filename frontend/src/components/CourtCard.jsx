import { Link } from 'react-router-dom';
import ScoreBoard from './ScoreBoard';
import StatusBadge from './StatusBadge';

function teamLabel(team) {
  return team?.players?.join(' / ') || '—';
}

export default function CourtCard({ court, linkToManage = false }) {
  const match = court.currentMatch;
  const next = court.nextMatch;

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-shuttle">Court {court.number}</h3>
        <StatusBadge status={match ? match.status : 'idle'} />
      </div>

      {match ? (
        <>
          <ScoreBoard match={match} />
          <p className="text-xs text-courtline/50 text-center capitalize">{match.type}</p>
        </>
      ) : (
        <p className="text-courtline/40 text-sm py-6 text-center">No match assigned</p>
      )}

      {next && (
        <div className="border-t border-stadium-700 pt-2 text-xs text-courtline/60">
          <span className="text-courtline/40">Next:</span> {teamLabel(next.teamA)} vs {teamLabel(next.teamB)}
        </div>
      )}

      {linkToManage && (
        <Link to={`/court/${court.number}`} className="btn-secondary text-center mt-1">
          Manage court
        </Link>
      )}
    </div>
  );
}
