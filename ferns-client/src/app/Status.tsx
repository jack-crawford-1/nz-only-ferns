import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";
import Navbar from "../components/nav/Navbar";
import Footer from "../components/Footer";

type StatusDetail = {
  name: string;
  summary: string;
  focus: string;
  badgeClass: string;
  dotClass: string;
};

const STATUS_DETAILS: StatusDetail[] = [
  {
    name: "Threatened – Nationally Critical",
    summary:
      "Extremely high risk of extinction. Populations are tiny, fragmented, or declining fast.",
    focus:
      "Immediate protection, intensive monitoring, and habitat safeguards.",
    badgeClass: "bg-[#ffe7e7] text-[#9b1c1c]",
    dotClass: "bg-[#dc2626]",
  },
  {
    name: "Threatened – Nationally Endangered",
    summary:
      "Very high risk of extinction in the near future without active management.",
    focus: "Targeted recovery plans and strong habitat protection.",
    badgeClass: "bg-[#fff0e5] text-[#9a3412]",
    dotClass: "bg-[#f97316]",
  },
  {
    name: "Threatened – Nationally Vulnerable",
    summary: "High risk of extinction if current pressures continue.",
    focus: "Reduce threats and protect core populations.",
    badgeClass: "bg-[#fff7d6] text-[#92400e]",
    dotClass: "bg-[#f59e0b]",
  },
  {
    name: "At Risk – Declining",
    summary:
      "Populations are shrinking, but not at the highest threat levels yet.",
    focus: "Track trends and address local pressures early.",
    badgeClass: "bg-[#fef3c7] text-[#92400e]",
    dotClass: "bg-[#f59e0b]",
  },
  {
    name: "At Risk – Relict",
    summary: "Naturally scarce remnants of formerly wider distributions.",
    focus: "Protect remaining refuges and avoid new disturbances.",
    badgeClass: "bg-[#ede9fe] text-[#4c1d95]",
    dotClass: "bg-[#7c3aed]",
  },
  {
    name: "At Risk – Naturally Uncommon",
    summary: "Always rare due to specialized habitat or limited range.",
    focus: "Protect unique habitats and reduce accidental damage.",
    badgeClass: "bg-[#ecfdf3] text-[#065f46]",
    dotClass: "bg-[#10b981]",
  },
  {
    name: "Not Threatened",
    summary: "Stable populations with no immediate conservation concerns.",
    focus: "Maintain habitat quality and monitor ecosystem health.",
    badgeClass: "bg-[#e6f7ed] text-[#166534]",
    dotClass: "bg-[#16a34a]",
  },
  {
    name: "Data Deficient",
    summary: "Not enough reliable data yet to assign a clear status.",
    focus: "Prioritize surveys, herbarium records, and field research.",
    badgeClass: "bg-[#f1f5f9] text-[#334155]",
    dotClass: "bg-[#94a3b8]",
  },
  {
    name: "Not Evaluated",
    summary: "Not yet assessed under the threat classification system.",
    focus: "Schedule assessment once baseline data are compiled.",
    badgeClass: "bg-[#eef2ff] text-[#3730a3]",
    dotClass: "bg-[#6366f1]",
  },
  {
    name: "Not Assessed",
    summary: "No current assessment available for this taxon.",
    focus: "Gather records and align evidence for review.",
    badgeClass: "bg-[#eef2ff] text-[#3730a3]",
    dotClass: "bg-[#6366f1]",
  },
  {
    name: "Taxonomically Indistinct",
    summary: "Unclear taxonomy or boundaries require clarification.",
    focus: "Resolve taxonomy before assigning a definitive status.",
    badgeClass: "bg-[#f1f5f9] text-[#475569]",
    dotClass: "bg-[#64748b]",
  },
  {
    name: "Non-resident Native – Vagrant",
    summary: "Occasional visitors that do not form stable populations.",
    focus: "Record sightings but no ongoing management is required.",
    badgeClass: "bg-[#f8fafc] text-[#475569]",
    dotClass: "bg-[#94a3b8]",
  },
];

const STATUS_GROUPS = [
  {
    title: "Threatened",
    description: "Highest concern categories that require urgent action.",
    statuses: [
      "Threatened – Nationally Critical",
      "Threatened – Nationally Endangered",
      "Threatened – Nationally Vulnerable",
    ],
  },
  {
    title: "At Risk",
    description: "Species under pressure but not yet in the threatened tier.",
    statuses: [
      "At Risk – Declining",
      "At Risk – Relict",
      "At Risk – Naturally Uncommon",
    ],
  },
  {
    title: "Other classifications",
    description: "Stable or unassessed categories used for completeness.",
    statuses: [
      "Not Threatened",
      "Data Deficient",
      "Not Evaluated",
      "Not Assessed",
      "Taxonomically Indistinct",
      "Non-resident Native – Vagrant",
    ],
  },
];

const STATUS_LOOKUP = new Map(
  STATUS_DETAILS.map((status) => [status.name, status])
);

export default function Status() {
  const [examplesByStatus, setExamplesByStatus] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    fetchFerns()
      .then((data: FernRecord[]) => {
        const nextExamples: Record<string, string[]> = {};

        data.forEach((fern) => {
          const status =
            fern.conservationStatus ?? fern.notes?.conservationStatus ?? "Unknown";
          if (!nextExamples[status]) {
            nextExamples[status] = [];
          }
          if (nextExamples[status].length < 2) {
            nextExamples[status].push(fern.scientificName);
          }
        });

        setExamplesByStatus(nextExamples);
      })
      .catch(() => {
        setExamplesByStatus({});
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#22342606]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-32">
        <section className="mb-8 flex flex-col gap-6 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#20624a]">
                Status
              </p>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Conservation status
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e2f0e8] px-3 py-1 font-semibold text-[#1f4d3a]">
              {STATUS_DETAILS.length} status labels
            </span>
            <span
              className="hidden h-4 w-px bg-gray-200 sm:inline-block"
              aria-hidden
            />
            <span className="text-gray-500">
              Based on New Zealand threat classifications
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/ferns">
              <button className="rounded-full bg-[#1f4d3a] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#143324] hover:shadow-xl">
                View fern list
              </button>
            </Link>
            <Link
              to={`/ferns?status=${encodeURIComponent(
                "Threatened – Nationally Critical"
              )}`}
            >
              <button className="rounded-full border border-[#c7d9cf] bg-white px-5 py-2 text-sm font-semibold text-[#1f4d3a] shadow-sm transition hover:border-[#1f4d3a]">
                See most threatened
              </button>
            </Link>
          </div>
        </section>

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Status ladder
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ordered from highest urgency to lower concern categories.
            </p>
            <div className="mt-4 space-y-4">
              {STATUS_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {group.title}
                  </p>
                  <div className="mt-2 space-y-2">
                    {group.statuses.map((statusName) => {
                      const status = STATUS_LOOKUP.get(statusName);
                      if (!status) return null;
                      return (
                        <div
                          key={status.name}
                          className="flex items-center gap-3 rounded-xl bg-[#f8fafc] px-3 py-2"
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${status.dotClass}`}
                            aria-hidden
                          />
                          <span className="text-sm font-semibold text-gray-800">
                            {status.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              How to read a status
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Status labels combine multiple signals to describe risk.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li className="rounded-xl bg-[#f3f7f4] px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                  Population
                </span>
                <p className="mt-1 text-sm text-gray-700">
                  Size of the population and how widely it is distributed.
                </p>
              </li>
              <li className="rounded-xl bg-[#f3f7f4] px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                  Trend
                </span>
                <p className="mt-1 text-sm text-gray-700">
                  Whether numbers are increasing, stable, or declining.
                </p>
              </li>
              <li className="rounded-xl bg-[#f3f7f4] px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                  Threats
                </span>
                <p className="mt-1 text-sm text-gray-700">
                  Habitat loss, invasive species, climate stress, or human
                  impact.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-10">
          {STATUS_GROUPS.map((group) => (
            <div key={group.title} className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#20624a]">
                    {group.title}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {group.title} statuses
                  </h2>
                </div>
                <p className="max-w-2xl text-sm text-gray-600">
                  {group.description}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {group.statuses.map((statusName) => {
                  const status = STATUS_LOOKUP.get(statusName);
                  if (!status) return null;
                  const examples = examplesByStatus[status.name] || [];

                  return (
                    <article
                      key={status.name}
                      className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {status.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${status.badgeClass}`}
                        >
                          Status
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">
                        {status.summary}
                      </p>
                      <div className="mt-4 rounded-xl bg-[#f3f7f4] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                          Focus
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          {status.focus}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                          Examples
                        </span>
                        {examples.length > 0 ? (
                          examples.map((example) => (
                            <span
                              key={example}
                              className="rounded-full bg-[#edf4f0] px-3 py-1 text-[11px] font-semibold text-[#1f4d3a]"
                            >
                              {example}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            Examples coming soon
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <Footer />
      </main>
    </div>
  );
}
