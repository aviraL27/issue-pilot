import { Copy } from 'lucide-react';

export default function CommentTemplateGenerator({ title }) {
  const template = `Hi! I'd like to work on this issue. I understand the goal is: "${title}". If this is still available, I can start by reproducing it and opening a focused PR.`;

  return (
    <div className="rounded-github border border-line bg-white p-4 shadow-subtle">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-mono text-sm font-semibold text-ink">comment-template</h3>
        <button
          onClick={() => navigator.clipboard.writeText(template)}
          className="inline-flex items-center gap-2 rounded-badge border border-line px-2 py-1 font-mono text-xs hover:border-available"
        >
          <Copy size={14} />
          copy
        </button>
      </div>
      <p className="text-sm leading-6 text-muted">{template}</p>
    </div>
  );
}
