import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import CourtCard from '../components/CourtCard';
import MatchForm from '../components/MatchForm';
import AssignMatchRow from '../components/AssignMatchRow';

export default function CentralDashboard() {
  const { courts } = useSocket();
  const [unassigned, setUnassigned] = useState([]);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  const loadUnassigned = async () => {
    const { data } = await api.get('/matches?status=scheduled');
    setUnassigned(data.matches);
  };

  useEffect(() => {
    loadUnassigned();
  }, [courts]); // refresh whenever a court update comes in (e.g. after promotion)

  const handleCreate = async (payload) => {
    setCreating(true);
    setMessage('');
    try {
      await api.post('/matches', payload);
      setMessage('Match created. Assign it to a court below.');
      await loadUnassigned();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create match');
    } finally {
      setCreating(false);
    }
  };

  const handleAssign = async (matchId, court, slot) => {
    setMessage('');
    try {
      await api.patch(`/matches/${matchId}/assign`, { court, slot });
      await loadUnassigned();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to assign match');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10">
      <h1 className="text-3xl text-shuttle">Central Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
        <MatchForm onSubmit={handleCreate} submitting={creating} />

        <div className="card p-5">
          <h3 className="text-lg text-shuttle mb-2">Assign Matches to Courts</h3>
          {message && <p className="text-sm text-shuttle mb-2">{message}</p>}
          {unassigned.length === 0 ? (
            <p className="text-courtline/40 text-sm py-4">No unassigned matches waiting.</p>
          ) : (
            unassigned.map((m) => (
              <AssignMatchRow key={m._id} match={m} courts={courts} onAssign={handleAssign} />
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl text-courtline mb-4">All Courts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => (
            <CourtCard key={court._id || court.number} court={court} linkToManage />
          ))}
        </div>
      </div>
    </div>
  );
}
