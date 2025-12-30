type LoadingScreenProps = {
  title?: string;
  description?: string;
};

export default function LoadingScreen({
  title = "Loading",
  description = "Preparing the latest fern records.",
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#e9f3ff] via-white to-[#f6f8fb]">
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24">
        <div className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1967d2]">
            Loading
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">{description}</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#1e60d4]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#0fb59c] [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#1e60d4] [animation-delay:300ms]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Please wait
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-xl bg-[#f3f6ff]" />
            <div className="h-20 rounded-xl bg-[#f3f6ff]" />
            <div className="h-20 rounded-xl bg-[#f3f6ff]" />
          </div>
        </div>
      </main>
    </div>
  );
}
