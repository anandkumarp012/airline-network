export default function StatCard({ label, value, detail, accent = 'cyan' }) {
  const accentMap = {
    cyan: 'from-sky-100 to-white text-sky-700 border-sky-200',
    blue: 'from-sky-100 to-white text-sky-700 border-sky-200',
    emerald: 'from-cyan-50 to-white text-cyan-700 border-cyan-200',
    purple: 'from-sky-100 to-white text-sky-700 border-sky-200',
    amber: 'from-sky-100 to-white text-sky-700 border-sky-200',
  };

  return (
    <div className={`card-surface rounded-2xl border bg-gradient-to-br ${accentMap[accent] || accentMap.cyan} p-5`}>
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      {detail && <div className="mt-2 text-sm text-slate-300">{detail}</div>}
    </div>
  );
}
