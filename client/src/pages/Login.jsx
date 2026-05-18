import { Link, useNavigate } from 'react-router-dom';
import { MarkGithubIcon } from '@primer/octicons-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { loginWithGitHub, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function run(provider) {
    try {
      setError('');
      await provider();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Check Firebase configuration.');
    }
  }

  return (
    <main className="grid min-h-screen bg-white md:grid-cols-2">
      <section className="flex flex-col justify-center px-6 py-12 md:px-16">
        <Link to="/" className="mb-16 font-mono text-lg font-semibold text-ink">IssuePilot</Link>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-normal text-ink">Find your next contribution</h1>
          <p className="mt-4 text-sm leading-6 text-muted">Sign in to save repos, keep bookmarks, and use your GitHub rate limit without pasting tokens every session.</p>
          <div className="mt-8 space-y-3">
            <button onClick={() => run(loginWithGitHub)} className="flex w-full items-center justify-center gap-2 rounded-github bg-ink px-4 py-3 font-medium text-white hover:bg-[#161B22]">
              <MarkGithubIcon size={18} />
              Continue with GitHub
            </button>
            <button onClick={() => run(loginWithGoogle)} className="flex w-full items-center justify-center gap-2 rounded-github border border-line bg-white px-4 py-3 font-medium text-ink hover:border-available">
              <span className="font-bold text-danger">G</span>
              Continue with Google
            </button>
          </div>
          {error && <p className="mt-4 font-mono text-sm text-danger">&gt; Error: {error}</p>}
          <Link to="/analyze" className="mt-6 inline-block font-mono text-sm text-muted hover:text-ink">
            No account needed for public repos — try without signing in →
          </Link>
        </div>
      </section>
      <section className="hidden items-center justify-center bg-ink p-10 md:flex">
        <div className="terminal-scroll h-[520px] w-full max-w-xl overflow-hidden rounded-github border border-[#30363D] bg-[#010409] p-5 font-mono text-sm text-[#C9D1D9] shadow-subtle">
          <p>$ issuepilot analyze facebook/react</p>
          <p className="mt-5 animate-typefade">fetching issues... 847 found</p>
          <p className="mt-3 animate-typefade" style={{ animationDelay: '0.6s' }}>scanning assignees...</p>
          <p className="mt-3 animate-typefade" style={{ animationDelay: '1.2s' }}>checking comments...</p>
          <p className="mt-6 text-available">✓ #42891 — Available (no assignee, no claims)</p>
          <p className="mt-3 text-warning">! #42887 — Likely Taken (comment: "I'll work on this")</p>
          <p className="mt-3 text-danger">x #42881 — Taken (assigned to @gaearon)</p>
          <p className="mt-8">ready<span className="animate-cursor">▋</span></p>
        </div>
      </section>
    </main>
  );
}
