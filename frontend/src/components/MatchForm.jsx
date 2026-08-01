import { useState } from 'react';

const emptyState = {
  type: 'singles',
  teamAP1: '',
  teamAP2: '',
  teamBP1: '',
  teamBP2: '',
};

export default function MatchForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(emptyState);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const teamA = { players: form.type === 'singles' ? [form.teamAP1] : [form.teamAP1, form.teamAP2] };
    const teamB = { players: form.type === 'singles' ? [form.teamBP1] : [form.teamBP1, form.teamBP2] };
    onSubmit({ type: form.type, teamA, teamB });
    setForm(emptyState);
  };

  const isValid =
    form.teamAP1.trim() &&
    form.teamBP1.trim() &&
    (form.type === 'singles' || (form.teamAP2.trim() && form.teamBP2.trim()));

  return (
    <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-4">
      <h3 className="text-lg text-shuttle">Create Match</h3>

      <div className="flex gap-2">
        {['singles', 'doubles'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: t }))}
            className={form.type === t ? 'btn-primary' : 'btn-secondary'}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm text-teamA mb-1">Team A</legend>
          <input className="input-field" placeholder="Player 1" value={form.teamAP1} onChange={update('teamAP1')} />
          {form.type === 'doubles' && (
            <input className="input-field" placeholder="Player 2" value={form.teamAP2} onChange={update('teamAP2')} />
          )}
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm text-teamB mb-1">Team B</legend>
          <input className="input-field" placeholder="Player 1" value={form.teamBP1} onChange={update('teamBP1')} />
          {form.type === 'doubles' && (
            <input className="input-field" placeholder="Player 2" value={form.teamBP2} onChange={update('teamBP2')} />
          )}
        </fieldset>
      </div>

      <button type="submit" disabled={!isValid || submitting} className="btn-primary">
        {submitting ? 'Creating...' : 'Create Match'}
      </button>
    </form>
  );
}
