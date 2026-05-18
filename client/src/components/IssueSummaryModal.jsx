import ReactMarkdown from 'react-markdown';
import VerdictBadge from './VerdictBadge';

export default function IssueSummaryModal({ issue, aiSummary }) {
  if (!issue) return null;
  return (
    <div className="rounded-github border border-line bg-white p-5 shadow-subtle">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-badge bg-[#F6F8FA] px-2 py-1 font-mono text-xs text-muted">#{issue.number}</span>
        <VerdictBadge verdict={issue.verdict} />
      </div>
      <h1 className="text-2xl font-bold text-ink">{issue.title}</h1>
      <p className="mt-3 whitespace-pre-line border-l-[3px] border-l-available bg-[#F6F8FA] p-3 font-mono text-sm text-ink">
        {aiSummary}
      </p>
      <div className="prose prose-sm mt-5 max-w-none text-ink">
        <ReactMarkdown>{issue.body || 'No issue description provided.'}</ReactMarkdown>
      </div>
    </div>
  );
}
