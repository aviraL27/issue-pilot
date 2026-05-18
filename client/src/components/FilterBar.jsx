export default function FilterBar({ filters, setFilters, labels }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const toggleLabel = (label) => {
    setFilters((current) => ({
      ...current,
      labels: current.labels.includes(label)
        ? current.labels.filter((item) => item !== label)
        : [...current.labels, label]
    }));
  };

  return (
    <aside className="border-r border-line bg-[#F6F8FA] p-4 md:sticky md:top-[65px] md:h-[calc(100vh-65px)] md:w-72">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold text-ink">filters</h2>
        <button
          onClick={() => setFilters({ verdict: 'ALL', category: 'ALL', labels: [], sort: 'newest' })}
          className="font-mono text-xs text-muted hover:text-ink"
        >
          reset
        </button>
      </div>
      <label className="mb-4 block">
        <span className="mb-1 block font-mono text-xs text-muted">verdict</span>
        <select
          value={filters.verdict}
          onChange={(event) => update('verdict', event.target.value)}
          className="w-full rounded-input border border-line bg-white px-2 py-2 text-sm"
        >
          <option value="ALL">All</option>
          <option value="AVAILABLE">Available</option>
          <option value="LIKELY_TAKEN">Likely Taken</option>
          <option value="TAKEN">Taken</option>
        </select>
      </label>
      <label className="mb-4 block">
        <span className="mb-1 block font-mono text-xs text-muted">category</span>
        <select
          value={filters.category}
          onChange={(event) => update('category', event.target.value)}
          className="w-full rounded-input border border-line bg-white px-2 py-2 text-sm"
        >
          {['ALL', 'Bug', 'Feature', 'Documentation', 'Testing', 'Performance', 'Other', 'good first issue', 'help wanted'].map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            )
          )}
        </select>
      </label>
      <label className="mb-5 block">
        <span className="mb-1 block font-mono text-xs text-muted">sort</span>
        <select
          value={filters.sort}
          onChange={(event) => update('sort', event.target.value)}
          className="w-full rounded-input border border-line bg-white px-2 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="most-commented">Most commented</option>
          <option value="least-commented">Least commented</option>
        </select>
      </label>
      <div>
        <p className="mb-2 font-mono text-xs text-muted">labels</p>
        <div className="space-y-2">
          {labels.slice(0, 18).map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={filters.labels.includes(label)}
                onChange={() => toggleLabel(label)}
                className="h-4 w-4 accent-available"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
