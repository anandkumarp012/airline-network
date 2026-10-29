import { Menu } from 'lucide-react';

export default function Header({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sky-100 bg-white/95 px-6 py-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-white text-sky-700 hover:border-sky-500 hover:bg-sky-50 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-700">
        Indian Network
      </div>
    </header>
  );
}
