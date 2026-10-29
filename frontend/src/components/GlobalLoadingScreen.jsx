import { CometSpinner } from '@/components/loading-ui/comet-spinner';

export default function GlobalLoadingScreen({ exiting }) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex h-full min-h-screen w-full items-center justify-center bg-white transition-opacity duration-500 ${exiting ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      aria-hidden={exiting}
    >
      <CometSpinner className="size-12" />
    </div>
  );
}
