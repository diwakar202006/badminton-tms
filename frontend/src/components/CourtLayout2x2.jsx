import { useState } from 'react';

/**
 * Visual court split into 4 cells by a net line down the middle:
 *   B2 | B1     <- Team B far side (net at top)
 *   ---+---
 *   A2 | A1     <- Team A near side
 *
 * For singles, only the A1 / B1 cells are used; A2 / B2 are hidden.
 *
 * Flow: tap a player chip from the roster strip to "pick it up", then tap a
 * cell on that player's own side to drop them there (swaps if occupied).
 */
export default function CourtLayout2x2({ match, positions, editable, onChange }) {
  const [picked, setPicked] = useState(null); // { team: 'A'|'B', player: string } | null

  const isDoubles = match.type === 'doubles';
  const cells = isDoubles
    ? [
        { key: 'B2', team: 'B', row: 0, col: 0 },
        { key: 'B1', team: 'B', row: 0, col: 1 },
        { key: 'A2', team: 'A', row: 1, col: 0 },
        { key: 'A1', team: 'A', row: 1, col: 1 },
      ]
    : [
        { key: 'B1', team: 'B', row: 0, col: 1 },
        { key: 'A1', team: 'A', row: 1, col: 1 },
      ];

  const roster = [
    ...match.teamA.players.map((p) => ({ team: 'A', player: p })),
    ...match.teamB.players.map((p) => ({ team: 'B', player: p })),
  ];

  const handleChipTap = (entry) => {
    if (!editable) return;
    const already = picked && picked.player === entry.player;
    setPicked(already ? null : entry);
  };

  const handleCellTap = (cell) => {
    if (!editable || !picked) return;
    if (picked.team !== cell.team) return; // can only drop on own side

    const next = { ...positions };
    // find if picked player already occupies a slot; if so clear it first
    Object.keys(next).forEach((slotKey) => {
      if (next[slotKey] === picked.player) next[slotKey] = null;
    });
    const displaced = next[cell.key];
    next[cell.key] = picked.player;
    if (displaced) {
      // put displaced player into whatever slot the picked player vacated (if any)
      const vacated = Object.keys(positions).find(
        (k) => positions[k] === picked.player && k !== cell.key
      );
      if (vacated) next[vacated] = displaced;
    }
    onChange(next);
    setPicked(null);
  };

  const isPlaced = (name) => Object.values(positions).includes(name);

  return (
    <div className="flex flex-col gap-4">
      {/* Court grid */}
      <div className="mx-auto w-full max-w-xs">
        <div className="grid grid-cols-2 gap-1 bg-stadium-950 p-1 rounded-lg border-2 border-courtline/30">
          {cells.map((cell) => {
            const occupant = positions[cell.key];
            const teamColor = cell.team === 'A' ? 'border-teamA text-teamA' : 'border-teamB text-teamB';
            return (
              <button
                key={cell.key}
                type="button"
                disabled={!editable}
                onClick={() => handleCellTap(cell)}
                className={`aspect-square rounded-md border-2 ${teamColor} bg-stadium-800 flex flex-col items-center justify-center gap-1 transition-transform ${
                  editable ? 'hover:scale-[1.02] active:scale-95 cursor-pointer' : 'cursor-default'
                } ${picked && picked.team === cell.team ? 'ring-2 ring-shuttle' : ''}`}
              >
                <span className="text-[10px] uppercase tracking-widest text-courtline/40">{cell.key}</span>
                <span className="text-sm font-medium text-center px-1">{occupant || 'Empty'}</span>
              </button>
            );
          })}
        </div>
        <div className="text-center text-[10px] uppercase tracking-widest text-courtline/30 mt-1">
          net ↑ far side / near side ↓
        </div>
      </div>

      {/* Roster chips to pick up and place */}
      {editable && (
        <div className="flex flex-wrap gap-2 justify-center">
          {roster.map((entry) => (
            <button
              key={entry.player}
              type="button"
              onClick={() => handleChipTap(entry)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                entry.team === 'A' ? 'border-teamA text-teamA' : 'border-teamB text-teamB'
              } ${picked?.player === entry.player ? 'bg-shuttle text-stadium-950 border-shuttle' : 'bg-stadium-800'} ${
                isPlaced(entry.player) ? 'opacity-60' : ''
              }`}
            >
              {entry.player} {isPlaced(entry.player) ? '✓' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
