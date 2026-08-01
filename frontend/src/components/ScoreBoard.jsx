function teamLabel(team) {
  return team?.players?.join(' / ') || '—';
}

export default function ScoreBoard({ match, size = 'md' }) {
  if (!match) return null;

  const digitSize = size === 'lg' ? 'text-6xl md:text-7xl' : 'text-3xl md:text-4xl';

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="text-right">
        <p className="text-sm text-teamA truncate">{teamLabel(match.teamA)}</p>
        <p className={`score-digit ${digitSize} text-teamA leading-none`}>{match.score?.teamA ?? 0}</p>
      </div>
      <div className="text-courtline/30 font-display text-xl">–</div>
      <div className="text-left">
        <p className="text-sm text-teamB truncate">{teamLabel(match.teamB)}</p>
        <p className={`score-digit ${digitSize} text-teamB leading-none`}>{match.score?.teamB ?? 0}</p>
      </div>
    </div>
  );
}
