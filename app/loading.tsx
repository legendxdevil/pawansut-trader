export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-black text-white flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-neutral-800" />
          <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
        <p className="text-xs text-neutral-500 font-mono tracking-wider uppercase">
          Loading Pawansut Trader...
        </p>
      </div>
    </div>
  );
}
