import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import AuthNav from '../components/AuthNav';
import FilterBar from '../components/FilterBar';
import IssueCard from '../components/IssueCard';
import ReanalyzeBar from '../components/ReanalyzeBar';
import RepoHealthCard from '../components/RepoHealthCard';
import { useRepo } from '../context/RepoContext';

export default function Analyze() {
  const { repoState, loading, error, toast, analyze, reanalyze } = useRepo();
  const [repoUrl, setRepoUrl] = useState(repoState.owner ? `${repoState.owner}/${repoState.repo}` : '');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [filters, setFilters] = useState({ verdict: 'ALL', category: 'ALL', labels: [], sort: 'newest' });
  const repoLabel = repoState.owner ? `${repoState.owner}/${repoState.repo}` : repoUrl;

  async function submit(event) {
    event.preventDefault();
    if (repoUrl.trim()) await analyze(repoUrl);
  }

  const labels = useMemo(() => {
    const all = repoState.issues.flatMap((issue) => issue.labels?.map((label) => label.name) || []);
    return [...new Set(all)].sort();
  }, [repoState.issues]);

  const issues = useMemo(() => {
    let next = [...repoState.issues];
    if (filters.verdict !== 'ALL') next = next.filter((issue) => issue.verdict === filters.verdict);
    if (filters.category === 'good first issue') next = next.filter((issue) => issue.goodFirstIssue);
    else if (filters.category === 'help wanted') next = next.filter((issue) => issue.helpWanted);
    else if (filters.category !== 'ALL') next = next.filter((issue) => issue.category === filters.category);
    if (filters.labels.length) {
      next = next.filter((issue) => filters.labels.every((label) => issue.labelNames?.includes(label)));
    }
    next.sort((a, b) => {
      if (filters.sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (filters.sort === 'most-commented') return b.commentsCount - a.commentsCount;
      if (filters.sort === 'least-commented') return a.commentsCount - b.commentsCount;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return next;
  }, [repoState.issues, filters]);

  return (
    <main className="min-h-screen bg-white text-ink">
      <header className="glass sticky top-0 z-20 border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
          <Link to="/" className="font-mono text-base font-semibold">IssuePilot</Link>
          <form onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2 border border-line bg-white px-3 py-2 shadow-subtle">
            <Search size={16} className="text-muted" />
            <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="owner/repo" className="min-w-0 flex-1 border-0 font-mono text-sm outline-none" />
            <button className="rounded-badge bg-ink px-3 py-1.5 font-mono text-xs text-white hover:bg-[#161B22]">analyze</button>
          </form>
          <RepoHealthCard health={repoState.health} compact />
          <AuthNav />
          <button onClick={() => setMobileFilters((value) => !value)} className="inline-flex items-center gap-2 rounded-badge border border-line px-3 py-2 font-mono text-xs md:hidden">
            <SlidersHorizontal size={14} /> filters
          </button>
        </div>
      </header>

      {repoState.fetchedAt && (
        <ReanalyzeBar fetchedAt={repoState.fetchedAt} loading={loading} onReanalyze={() => reanalyze(repoLabel)} />
      )}
      {toast && <div className="mx-auto mt-3 max-w-6xl px-4 font-mono text-sm text-available">{toast}</div>}
      {error && <div className="mx-auto mt-3 max-w-6xl px-4 font-mono text-sm text-danger">{error}</div>}

      <div className="mx-auto flex max-w-6xl">
        <div className={`${mobileFilters ? 'block' : 'hidden'} md:block`}>
          <FilterBar filters={filters} setFilters={setFilters} labels={labels} />
        </div>
        <section className="min-w-0 flex-1 px-4 py-5">
          {!repoState.issues.length && (
            <div className="rounded-github border border-line bg-white p-8 text-center shadow-subtle">
              <p className="font-mono text-sm text-muted">&gt; Paste a public GitHub repo to start scanning.</p>
            </div>
          )}
          {repoState.issues.length > 0 && issues.length === 0 && (
            <p className="font-mono text-sm text-muted">&gt; No issues match the current filters.</p>
          )}
          <div className="space-y-3">
            {issues.map((issue) => (
              <IssueCard key={issue.id || issue.number} issue={issue} owner={repoState.owner} repo={repoState.repo} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
