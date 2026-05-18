const tone = {
  Healthy: 'text-available border-available/30 bg-available/10',
  Moderate: 'text-warning border-warning/30 bg-warning/10',
  'Low Activity': 'text-danger border-danger/30 bg-danger/10'
};

export default function RepoHealthCard({ health, compact = false }) {
  if (!health) return null;
  return (
    <div className={`rounded-github border border-line bg-white shadow-subtle ${compact ? 'px-3 py-2' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-muted">repo-health</span>
        <span className={`rounded-badge border px-2 py-1 font-mono text-xs ${tone[health.status] || tone.Moderate}`}>
          {health.status} · {health.score}
        </span>
      </div>
      {!compact && (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt className="font-mono text-xs text-muted">last commit</dt><dd>{health.daysSinceLastCommit ?? 'n/a'} days</dd></div>
          <div><dt className="font-mono text-xs text-muted">merge rate</dt><dd>{health.mergeRate}%</dd></div>
          <div><dt className="font-mono text-xs text-muted">open ratio</dt><dd>{health.openClosedRatio}</dd></div>
          <div><dt className="font-mono text-xs text-muted">avg response</dt><dd>{health.avgIssueResponseTimeDays ?? 'n/a'} days</dd></div>
        </dl>
      )}
    </div>
  );
}
