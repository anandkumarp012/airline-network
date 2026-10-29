import { CometSpinner } from '@/components/loading-ui/comet-spinner';

export default function Loading({ message = 'Loading data...' }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/60 p-10 text-slate-300">
      <div className="flex items-center gap-3">
        <CometSpinner className="size-12" />
        <span>{message}</span>
      </div>
    </div>
  );
}
