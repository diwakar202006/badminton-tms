import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import CourtCard from '../components/CourtCard';

export default function Home() {
  const { courts } = useSocket();
  const liveCourts = courts.filter((c) => c.currentMatch && ['live', 'paused'].includes(c.currentMatch.status));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-12">
      <section className="text-center flex flex-col items-center gap-4 py-10">
        <h1 className="text-4xl md:text-6xl text-shuttle">Six Courts. One Live Board.</h1>
        <p className="text-courtline/60 max-w-xl">
          Follow every rally as it happens, check what's next, or catch up on results — no login required.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Link to="/live" className="btn-primary">Watch Live</Link>
          <Link to="/fixtures" className="btn-secondary">Fixtures</Link>
          <Link to="/results" className="btn-secondary">Results</Link>
          <Link to="/login" className="btn-secondary">Scorer Login</Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-courtline">Live right now</h2>
          <Link to="/live" className="text-sm text-shuttle hover:underline">See all courts →</Link>
        </div>
        {liveCourts.length === 0 ? (
          <p className="text-courtline/40 text-center py-10 card">No matches are live at the moment. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveCourts.map((court) => (
              <CourtCard key={court._id} court={court} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
