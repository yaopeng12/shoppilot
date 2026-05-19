export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/[0.95] text-black px-5 py-2.5 rounded-xl text-sm font-medium shadow-xl shadow-black/20 z-50 animate-slide-in-bottom backdrop-blur-sm">
      {message}
    </div>
  );
}
