import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Star } from 'lucide-react';
import { issueApi } from '../api/issueApi';
import CommentTemplateGenerator from '../components/CommentTemplateGenerator';
import IssueSummaryModal from '../components/IssueSummaryModal';
import VerdictBadge from '../components/VerdictBadge';
import { useAuth } from '../context/AuthContext';

export default function IssueDetail() {
  const { owner, repo, number } = useParams();
  const { user } = useAuth();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    issueApi.detail(owner, repo, number).then(setDetail).catch((err) => setError(err.response?.data?.message || '> Error: issue not found.'));
  }, [owner, repo, number]);

  async function bookmark() {
    if (!detail?.issue) return;
    await issueApi.bookmark({ owner, repo, issueNumber: number, title: detail.issue.title });
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <header className="glass sticky top-0 z-20 border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/analyze" className="font-mono text-sm text-muted hover:text-ink">← analyze</Link>
          <span className="font-mono text-sm text-muted">{owner}/{repo}#{number}</span>
        </div>
      </header>
      <section className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        {error && <p className="font-mono text-sm text-danger">{error}</p>}
        {!detail && !error && <p className="font-mono text-sm text-muted">loading issue<span className="animate-cursor">▋</span></p>}
        {detail?.issue && (
          <>
            <IssueSummaryModal issue={detail.issue} aiSummary={detail.aiSummary} />
            <div className="grid gap-4 md:grid-cols-[1fr_320px]">
              <div className="rounded-github border border-line bg-white p-4 shadow-subtle">
                <h2 className="font-mono text-sm font-semibold">verdict-reason</h2>
                <div className="mt-3"><VerdictBadge verdict={detail.issue.verdict} /></div>
                <p className="mt-3 text-sm leading-6 text-muted">{detail.issue.verdictReason}</p>
                <a href={detail.issue.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 font-mono text-sm text-ink hover:text-available">
                  open on GitHub <ExternalLink size={14} />
                </a>
              </div>
              <div className="space-y-4">
                {user && (
                  <button onClick={bookmark} className="inline-flex w-full items-center justify-center gap-2 rounded-github border border-line bg-white px-4 py-3 font-mono text-sm hover:border-available">
                    <Star size={16} /> bookmark issue
                  </button>
                )}
                <CommentTemplateGenerator title={detail.issue.title} />
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
