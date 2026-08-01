import { useSocket } from '../context/SocketContext';
import CourtCard from '../components/CourtCard';

export default function ViewerLive() {
  const { courts, connected } = useSocket();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl text-shuttle">Live Courts</h1>
        <span className={`text-xs ${connected ? 'text-teamA' : 'text-courtline/40'}`}>
          {connected ? '● connected' : '○ connecting...'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courts.map((court) => (
          <CourtCard key={court._id || court.number} court={court} />
        ))}
      </div>
    </div>
  );
}
