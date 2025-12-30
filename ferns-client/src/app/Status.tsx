import Navbar from "../components/nav/Navbar";

const STATUS_LEVELS = [
  {
    name: "Nationally Critical",
    summary:
      "Extremely high risk of extinction. Populations are tiny, fragmented, or declining fast.",
    focus: "Urgent protection, strict monitoring, and habitat safeguarding.",
    tone: "bg-[#ffe7e7] text-[#9b1c1c]",
  },
  {
    name: "Nationally Endangered",
    summary:
      "Very high risk of extinction in the near future without active management.",
    focus: "Targeted recovery plans and careful tracking of known sites.",
    tone: "bg-[#fff0e5] text-[#9a3412]",
  },
  {
    name: "Nationally Vulnerable",
    summary: "High risk of extinction if current pressures continue.",
    focus: "Reduce threats and protect key habitats.",
    tone: "bg-[#fff7d6] text-[#92400e]",
  },
  {
    name: "Declining",
    summary:
      "Populations are shrinking, but not at the highest threat levels yet.",
    focus: "Track trends and address local pressures early.",
    tone: "bg-[#fef3c7] text-[#92400e]",
  },
  {
    name: "Recovering",
    summary: "Populations are improving due to recent conservation actions.",
    focus: "Maintain momentum and protect gains.",
    tone: "bg-[#e0f2fe] text-[#1e3a8a]",
  },
  {
    name: "Relict",
    summary:
      "Stable but naturally scarce remnants of formerly wider distributions.",
    focus: "Protect remaining refuges and avoid new disturbances.",
    tone: "bg-[#ede9fe] text-[#4c1d95]",
  },
  {
    name: "Naturally Uncommon",
    summary: "Always rare due to specialized habitat or limited range.",
    focus: "Protect unique habitats and reduce accidental damage.",
    tone: "bg-[#ecfdf3] text-[#065f46]",
  },
  {
    name: "Not Threatened",
    summary: "Stable populations with no immediate conservation concerns.",
    focus: "Monitor overall ecosystem health and maintain habitat quality.",
    tone: "bg-[#e6f7ed] text-[#166534]",
  },
  {
    name: "Data Deficient",
    summary: "Not enough reliable data yet to assign a clear status.",
    focus: "Prioritize surveys, herbarium records, and field research.",
    tone: "bg-[#f1f5f9] text-[#334155]",
  },
];

export default function Status() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#e9f3ff] via-white to-[#f6f8fb]">
      <Navbar ferns={[]} />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-32">
        <section className="mb-8 flex flex-col gap-6 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1967d2]">
                Status
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Conservation status
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e0edff] px-3 py-1 font-semibold text-[#1e60d4]">
              9 status levels
            </span>
            <span
              className="hidden h-4 w-px bg-gray-200 sm:inline-block"
              aria-hidden
            />
            <span className="text-gray-500">
              Based on New Zealand threat classifications
            </span>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {STATUS_LEVELS.map((status) => (
            <article
              key={status.name}
              className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {status.name}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${status.tone}`}
                >
                  Status
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{status.summary}</p>
              <div className="mt-4 rounded-xl bg-[#f3f6ff] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1e60d4]">
                  Focus
                </p>
                <p className="mt-1 text-sm text-gray-700">{status.focus}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            How statuses are assigned
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Conservation status combines population size, rate of decline, and
            distribution data. Botanists review herbarium records, field
            surveys, and monitoring reports to determine the most accurate
            classification.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[#f3f6ff] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1e60d4]">
                Population
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Number of mature individuals and how they are distributed.
              </p>
            </div>
            <div className="rounded-xl bg-[#f3f6ff] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1e60d4]">
                Trend
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Whether a species is increasing, stable, or declining over time.
              </p>
            </div>
            <div className="rounded-xl bg-[#f3f6ff] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1e60d4]">
                Threats
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Habitat loss, invasive species, climate stress, or human impact.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
