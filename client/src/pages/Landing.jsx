import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AuthNav from '../components/AuthNav';
import VerdictBadge from '../components/VerdictBadge';
import { useRepo } from '../context/RepoContext';

const examples = ['facebook/react', 'vercel/next.js', 'tailwindlabs/tailwindcss'];

export default function Landing() {
  const [repoUrl, setRepoUrl] = useState('');
  const { analyze, loading } = useRepo();
  const navigate = useNavigate();

  async function submit(event, value = repoUrl) {
    event.preventDefault();
    if (!value.trim()) return;
    await analyze(value);
    navigate('/analyze');
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <nav className="glass sticky top-0 z-20 border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-mono text-lg font-semibold">IssuePilot</Link>
          <div className="flex items-center gap-2">
            <AuthNav />
          </div>
        </div>
      </nav>

      <section className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-16">
        <div className="max-w-4xl">
          <p className="mb-4 font-mono text-sm text-muted">$ find-open-source-work</p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-normal md:text-7xl">
            Find issues that are actually available.
          </h1>
          <p className="mt-5 max-w-2xl font-mono text-base leading-7 text-muted">
            Paste a GitHub repo. IssuePilot scans labels, assignees, linked PRs, and comment claims before you spend an afternoon chasing a taken task.
          </p>

          <form onSubmit={submit} className="mt-8 flex max-w-3xl items-center gap-2 border border-line bg-white p-2 shadow-subtle">
            <span className="hidden font-mono text-sm text-muted sm:inline">$ analyze →</span>
            <input
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/facebook/react"
              className="min-w-0 flex-1 rounded-input border-0 px-2 py-3 font-mono text-sm outline-none"
            />
            <button
              disabled={loading}
              className="inline-flex h-10 w-10 items-center justify-center rounded-badge bg-available text-white hover:bg-[#258A42] disabled:opacity-60"
              aria-label="Analyze repository"
            >
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                onClick={(event) => submit(event, example)}
                className="rounded-badge border border-line px-2.5 py-1.5 font-mono text-xs text-muted hover:border-available hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-3 md:grid-cols-3">
          {[
            ['#42891', 'Clarify event priority in concurrent rendering', 'AVAILABLE'],
            ['#42887', 'Improve docs for hydration warnings', 'LIKELY_TAKEN'],
            ['#42881', 'Fix stale cache invalidation edge case', 'TAKEN']
          ].map(([number, title, verdict], index) => (
            <div
              key={number}
              className="animate-typefade rounded-github border border-line bg-white p-4 shadow-subtle"
              style={{ animationDelay: `${index * 0.55}s` }}
            >
              <span className="rounded-badge bg-[#F6F8FA] px-2 py-1 font-mono text-xs text-muted">{number}</span>
              <p className="mt-3 min-h-12 text-sm font-medium">{title}</p>
              <VerdictBadge verdict={verdict} />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {['01 — Paste repo', '02 — We scan', '03 — You contribute'].map((step) => (
            <div key={step}>
              <p className="font-mono text-sm font-semibold text-ink">{step}</p>
              <p className="mt-3 text-sm leading-6 text-muted">Fast signals, minimal noise, and clear next actions for contributors.</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line px-4 py-6 text-center font-mono text-xs text-muted">
        © IssuePilot — built for contributors
      </footer>
    </main>
  );
}
