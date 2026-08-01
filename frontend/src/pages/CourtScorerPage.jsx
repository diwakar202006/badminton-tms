import { useParams } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import CourtLayout2x2 from '../components/CourtLayout2x2';
import ScoreBoard from '../components/ScoreBoard';
import StatusBadge from '../components/StatusBadge';

function teamLabel(team) {
  return team?.players?.join(' / ') || '—';
}

export default function CourtScorerPage() {
  const { courtNumber } = useParams();
  const { courts } = useSocket();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const court = courts.find((c) => c.number === Number(courtNumber));
  const match = court?.currentMatch || null;

  const call = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const updatePositions = (positions) =>
    call(() => api.patch(`/matches/${match._id}/positions`, { positions }));

  const setServer = (player) => call(() => api.patch(`/matches/${match._id}/server`, { player }));
  const start = () => call(() => api.patch(`/matches/${match._id}/start`));
  const scorePoint = (team) => call(() => api.patch(`/matches/${match._id}/score`, { team }));
  const undo = () => call(() => api.patch(`/matches/${match._id}/undo`));
  const pause = () => call(() => api.patch(`/matches/${match._id}/pause`));
  const resume = () => call(() => api.patch(`/matches/${match._id}/resume`));
  const finish = () => call(() => api.patch(`/matches/${match._id}/finish`));

  if (!court) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-courtline/40">Loading court...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-shuttle">Court {court.number}</h1>
        {match && <StatusBadge status={match.status} />}
      </div>

      {error && <p className="text-teamB text-sm">{error}</p>}

      {!match && (
        <div className="card p-10 text-center text-courtline/40">
          No match currently assigned to this court. Waiting for the Central Scorer...
        </div>
      )}

      {match && (match.status === 'assigned') && (
        <div className="card p-5 flex flex-col gap-6">
          <div className="text-center">
            <p className="text-sm text-courtline/50 capitalize">{match.type} match</p>
            <p className="mt-1">
              <span className="text-teamA">{teamLabel(match.teamA)}</span>
              <span className="text-courtline/40"> vs </span>
              <span className="text-teamB">{teamLabel(match.teamB)}</span>
            </p>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-wider text-courtline/50 mb-3 text-center">
              1. Set player positions
            </h3>
            <CourtLayout2x2 match={match} positions={match.positions} editable onChange={updatePositions} />
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-wider text-courtline/50 mb-3 text-center">
              2. Select first server
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {[...match.teamA.players, ...match.teamB.players].map((p) => (
                <button
                  key={p}
                  onClick={() => setServer(p)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    match.firstServer === p
                      ? 'bg-shuttle text-stadium-950 border-shuttle'
                      : 'bg-stadium-800 border-stadium-700 text-courtline'
                  }`}
                >
                  {match.firstServer === p ? '🏸 ' : ''}
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button onClick={start} disabled={busy} className="btn-primary">
            3. Start Match
          </button>
        </div>
      )}

      {match && ['live', 'paused'].includes(match.status) && (
        <div className="card p-6 flex flex-col gap-6">
          <ScoreBoard match={match} size="lg" />

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => scorePoint('A')}
              disabled={busy || match.status !== 'live'}
              className="btn-teamA py-4 text-lg"
            >
              +1 Team A
            </button>
            <button
              onClick={() => scorePoint('B')}
              disabled={busy || match.status !== 'live'}
              className="btn-teamB py-4 text-lg"
            >
              +1 Team B
            </button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={undo} disabled={busy || match.history.length === 0} className="btn-secondary">
              Undo
            </button>
            {match.status === 'live' ? (
              <button onClick={pause} disabled={busy} className="btn-secondary">
                Pause
              </button>
            ) : (
              <button onClick={resume} disabled={busy} className="btn-secondary">
                Resume
              </button>
            )}
            <button
              onClick={finish}
              disabled={busy || match.score.teamA === match.score.teamB}
              className="btn-primary"
            >
              Finish Match
            </button>
          </div>
        </div>
      )}

      {match && match.status === 'finished' && (
        <div className="card p-6 text-center flex flex-col gap-3">
          <ScoreBoard match={match} size="lg" />
          <p className="text-courtline/60">
            Winner:{' '}
            <span className={match.winner === 'teamA' ? 'text-teamA' : 'text-teamB'}>
              {match.winner === 'teamA' ? teamLabel(match.teamA) : teamLabel(match.teamB)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
