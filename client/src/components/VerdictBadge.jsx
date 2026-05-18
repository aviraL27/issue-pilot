import { verdictText } from '../utils/format';

const styles = {
  AVAILABLE: 'border-available/30 bg-available/10 text-available',
  LIKELY_TAKEN: 'border-warning/30 bg-warning/10 text-warning',
  TAKEN: 'border-danger/30 bg-danger/10 text-danger'
};

const marks = {
  AVAILABLE: '✓',
  LIKELY_TAKEN: '!',
  TAKEN: 'x'
};

export default function VerdictBadge({ verdict, loading = false }) {
  if (loading) {
    return (
      <span className="inline-flex items-center rounded-badge border border-line bg-white px-2 py-1 font-mono text-xs text-muted">
        scanning <span className="ml-1 animate-cursor">▋</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-badge border px-2 py-1 font-mono text-xs font-medium ${
        styles[verdict] || styles.AVAILABLE
      }`}
    >
      <span>{marks[verdict] || '✓'}</span>
      {verdictText(verdict)}
    </span>
  );
}
