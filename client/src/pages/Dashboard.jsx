import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { repoApi } from '../api/repoApi';
import { issueApi } from '../api/issueApi';
import TokenManager from '../components/TokenManager';
import { useAuth } from '../context/AuthContext';
import { useRepo } from '../context/RepoContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { reanalyze, loading } = useRepo();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [tab, setTab] = useState('watchlist');

  useEffect(() => {
    if (!user) return;
    repoApi.watchlist().then((data) => setWatchlist(data.watchlist || [])).catch(() => undefined);
    issueApi.bookmarks().then((data) => setBookmarks(data.bookmarks || [])).catch(() => undefined);
  }, [user]);

  async function addRepo(event) {
    event.preventDefault();
    if (!repoUrl.trim()) return;
    const data = await repoApi.addWatchlist(repoUrl);
    setWatchlist(data.watchlist || []);
    setRepoUrl('');
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <header className="glass sticky top-0 z-20 border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-mono text-base font-semibold">IssuePilot</Link>
          <div className="flex items-center gap-3">
            <Link to="/analyze" className="font-mono text-sm text-muted hover:text-ink">analyze</Link>
            <button onClick={handleLogout} className="rounded-badge border border-line px-3 py-1.5 font-mono text-xs hover:border-danger">logout</button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
        <aside className="rounded-github border border-line bg-[#F6F8FA] p-3 font-mono text-sm">
          {['watchlist', 'bookmarks', 'token', 'settings'].map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`block w-full rounded-badge px-3 py-2 text-left ${tab === item ? 'bg-white text-ink shadow-subtle' : 'text-muted hover:text-ink'}`}>
              ~ {item}
            </button>
          ))}
        </aside>
        <section className="min-w-0">
          <div className="mb-6">
            <p className="font-mono text-sm text-muted">signed in as</p>
            <h1 className="text-2xl font-bold">{user?.displayName || user?.email || 'Contributor'}</h1>
          </div>

          {tab === 'watchlist' && (
            <div className="space-y-4">
              <form onSubmit={addRepo} className="flex gap-2">
                <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="owner/repo" className="min-w-0 flex-1 rounded-input border border-line px-3 py-2 font-mono text-sm" />
                <button className="rounded-badge bg-ink px-3 py-2 font-mono text-sm text-white">add</button>
              </form>
              {watchlist.map((item) => (
                <div key={`${item.owner}/${item.repo}`} className="flex flex-col justify-between gap-3 rounded-github border border-line bg-white p-4 shadow-subtle sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-semibold">{item.owner}/{item.repo}</h2>
                    <p className="font-mono text-xs text-muted">added {new Date(item.addedAt).toLocaleDateString()}</p>
                  </div>
                  <button disabled={loading} onClick={() => reanalyze(`${item.owner}/${item.repo}`)} className="rounded-badge border border-line px-3 py-2 font-mono text-xs hover:border-available disabled:opacity-60">
                    ↻ re-analyze
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'bookmarks' && (
            <div className="space-y-3">
              {bookmarks.length === 0 && <p className="font-mono text-sm text-muted">&gt; No bookmarks yet.</p>}
              {bookmarks.map((bookmark) => (
                <Link key={`${bookmark.owner}/${bookmark.repo}/${bookmark.issueNumber}`} to={`/issue/${bookmark.owner}/${bookmark.repo}/${bookmark.issueNumber}`} className="block rounded-github border border-line bg-white p-4 shadow-subtle hover:-translate-y-0.5">
                  <span className="font-mono text-xs text-muted">{bookmark.owner}/{bookmark.repo}#{bookmark.issueNumber}</span>
                  <h2 className="mt-1 font-semibold">{bookmark.title}</h2>
                </Link>
              ))}
            </div>
          )}

          {tab === 'token' && <TokenManager />}
          {tab === 'settings' && <p className="font-mono text-sm text-muted">&gt; Dark mode is available through the Tailwind class strategy; add app-level persistence here when needed.</p>}
        </section>
      </div>
    </main>
  );
}
