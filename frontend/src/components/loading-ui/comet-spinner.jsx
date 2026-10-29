export function CometSpinner({ className = '' }) {
  return (
    <div
      className={`relative aspect-square ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="absolute inset-1 animate-[spin_3s_linear_infinite] rounded-full border-2 border-sky-100 border-r-sky-300 border-t-sky-500" />
      <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.45)]" />
      <div className="absolute left-1 top-1/2 h-1 w-5 -translate-y-1/2 -rotate-45 animate-[pulse_3s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent to-sky-300 opacity-80" />
    </div>
  );
}
