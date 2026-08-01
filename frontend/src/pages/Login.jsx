import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      if (user.role === 'central_scorer') navigate('/central');
      else navigate(`/court/${user.assignedCourt}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
        <h1 className="text-2xl text-shuttle text-center mb-2">Scorer Login</h1>
        {error && <p className="text-teamB text-sm text-center">{error}</p>}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-xs text-courtline/40 text-center">
          Central and Court Scorer accounts are provisioned by the tournament admin.
        </p>
      </form>
    </div>
  );
}
