const STYLES = {
  idle: 'bg-stadium-700 text-courtline/60',
  scheduled: 'bg-stadium-700 text-courtline/60',
  assigned: 'bg-stadium-700 text-courtline',
  live: 'bg-shuttle text-stadium-950 animate-pulse',
  paused: 'bg-teamB/80 text-stadium-950',
  finished: 'bg-teamA/70 text-stadium-950',
  occupied: 'bg-stadium-700 text-courtline',
};

const LABELS = {
  idle: 'Idle',
  scheduled: 'Scheduled',
  assigned: 'Ready',
  live: 'Live',
  paused: 'Paused',
  finished: 'Finished',
  occupied: 'Occupied',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STYLES[status] || 'bg-stadium-700 text-courtline'}`}>
      {LABELS[status] || status}
    </span>
  );
}
