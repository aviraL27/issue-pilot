import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import VerdictBadge from './VerdictBadge';
import { timeAgo, verdictTone } from '../utils/format';

const border = {
  available: 'border-l-available',
  warning: 'border-l-warning',
  danger: 'border-l-danger'
};

export default function IssueCard({ issue, owner, repo, bookmarked = false }) {
  const tone = verdictTone(issue.verdict);
  return (
    <Link
      to={`/issue/${owner}/${repo}/${issue.number}`}
      className={`block border border-l-[3px] ${border[tone]} border-y-line border-r-line bg-white p-4 shadow-subtle hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-badge bg-[#F6F8FA] px-2 py-1 font-mono text-xs text-muted">#{issue.number}</span>
            <span className="font-mono text-xs text-muted">{issue.category}</span>
            {bookmarked && <span className="font-mono text-xs text-available">bookmarked</span>}
          </div>
          <h3 className="line-clamp-2 text-base font-semibold text-ink">{issue.title}</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {issue.labels?.slice(0, 6).map((label) => (
              <span
                key={`${issue.number}-${label.name}`}
                className="inline-flex items-center gap-1 rounded-badge border border-line px-2 py-1 text-xs text-muted"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `#${label.color}` }} />
                {label.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-4 md:flex-col md:items-end">
          <div className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={14} />
              {issue.commentsCount}
            </span>
            <span>{timeAgo(issue.updatedAt || issue.createdAt)}</span>
          </div>
          <VerdictBadge verdict={issue.verdict} />
        </div>
      </div>
    </Link>
  );
}
