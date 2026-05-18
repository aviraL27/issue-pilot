import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TokenManager() {
  const { user, saveGithubToken } = useAuth();
  const [token, setToken] = useState('');
  const [status, setStatus] = useState(user?.hasGithubToken ? 'valid' : 'missing');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveGithubToken(token);
      setStatus('valid');
      setToken('');
    } catch {
      setStatus('invalid');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-github border border-line bg-[#0D1117] p-4 font-mono text-sm text-white shadow-subtle">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span>GITHUB_TOKEN=ghp_••••••••••••••••••••</span>
        <span className={status === 'valid' ? 'text-available' : status === 'invalid' ? 'text-danger' : 'text-warning'}>
          status: {status}
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="paste token"
          className="min-w-0 flex-1 rounded-input border border-[#30363D] bg-[#161B22] px-3 py-2 text-white placeholder:text-[#8B949E]"
        />
        <button
          disabled={saving || !token}
          className="rounded-badge border border-[#30363D] px-3 py-2 text-white hover:border-available disabled:opacity-60"
        >
          {saving ? 'verify…' : 'verify'}
        </button>
      </div>
    </form>
  );
}
