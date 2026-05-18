import { RefreshCw } from 'lucide-react';
import { timeAgo } from '../utils/format';

export default function ReanalyzeBar({ fetchedAt, loading, onReanalyze }) {
  return (
    <div className="border-y border-line bg-white px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-sm text-muted">
          $ last-checked · <span className="text-ink">{timeAgo(fetchedAt)}</span>
        </p>
        <button
          onClick={onReanalyze}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-badge border border-line bg-white px-3 py-1.5 font-mono text-sm text-ink hover:border-available disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          re-analyze
        </button>
      </div>
      {loading && <div className="mt-3 h-1 w-full overflow-hidden bg-[#F6F8FA]"><div className="h-full w-2/3 animate-pulse bg-available" /></div>}
    </div>
  );
}
