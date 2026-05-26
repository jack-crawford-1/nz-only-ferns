import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";
import Layout from "../components/Layout";
import { TIER_COLOR } from "../components/StatusTag";
import { getStatusMeta, statusOf, type StatusTier } from "../utils/format";

type StatusDetail = { name: string; summary: string; focus: string };

const STATUS_DETAILS: StatusDetail[] = [
  { name: "Threatened – Nationally Critical", summary: "Extremely high risk of extinction. Populations are tiny, fragmented, or declining fast.", focus: "Immediate protection, intensive monitoring, and habitat safeguards." },
  { name: "Threatened – Nationally Endangered", summary: "Very high risk of extinction in the near future without active management.", focus: "Targeted recovery plans and strong habitat protection." },
  { name: "Threatened – Nationally Vulnerable", summary: "High risk of extinction if current pressures continue.", focus: "Reduce threats and protect core populations." },
  { name: "At Risk – Declining", summary: "Populations are shrinking, but not at the highest threat levels yet.", focus: "Track trends and address local pressures early." },
  { name: "At Risk – Relict", summary: "Naturally scarce remnants of formerly wider distributions.", focus: "Protect remaining refuges and avoid new disturbances." },
  { name: "At Risk – Naturally Uncommon", summary: "Always rare due to specialised habitat or limited range.", focus: "Protect unique habitats and reduce accidental damage." },
  { name: "Not Threatened", summary: "Stable populations with no immediate conservation concerns.", focus: "Maintain habitat quality and monitor ecosystem health." },
  { name: "Data Deficient", summary: "Not enough reliable data yet to assign a clear status.", focus: "Prioritise surveys, herbarium records, and field research." },
  { name: "Not Evaluated", summary: "Not yet assessed under the threat classification system.", focus: "Schedule assessment once baseline data are compiled." },
  { name: "Taxonomically Indistinct", summary: "Unclear taxonomy or boundaries require clarification.", focus: "Resolve taxonomy before assigning a definitive status." },
  { name: "Non-resident Native – Vagrant", summary: "Occasional visitors that do not form stable populations.", focus: "Record sightings; no ongoing management is required." },
];

const TIER_LABEL: Record<StatusTier, string> = {
  threatened: "Threatened",
  "at-risk": "At risk",
  stable: "Not threatened",
  unknown: "Unassessed",
};

const GROUPS: { tier: StatusTier; description: string }[] = [
  { tier: "threatened", description: "Highest concern, facing a real risk of extinction." },
  { tier: "at-risk", description: "Under pressure, but not yet in the threatened tier." },
  { tier: "stable", description: "Secure populations with no immediate concern." },
  { tier: "unknown", description: "Not assessed, data-deficient, or taxonomically unresolved." },
];

export default function Status() {
  const [ferns, setFerns] = useState<FernRecord[]>([]);

  useEffect(() => {
    fetchFerns()
      .then((data: FernRecord[]) => setFerns(data))
      .catch(() => setFerns([]));
  }, []);

  const tierCounts = useMemo(() => {
    const counts: Record<StatusTier, number> = {
      threatened: 0,
      "at-risk": 0,
      stable: 0,
      unknown: 0,
    };
    ferns.forEach((f) => {
      counts[getStatusMeta(statusOf(f)).tier] += 1;
    });
    return counts;
  }, [ferns]);

  return (
    <Layout>
      <header className="border-b-2 border-ink py-10">
        <span className="label">Reference · NZ Threat Classification System</span>
        <h1 className="mt-4 text-[2.5rem] font-extrabold leading-[0.95] tracking-[-0.03em] md:text-[3.75rem]">
          Conservation status
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          Every species in the archive carries a status from the New Zealand
          Threat Classification System. Each combines population size, trend,
          and threats into a single category. They group into four tiers.
        </p>
      </header>

      {/* Tier legend with live counts */}
      <section className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
        {GROUPS.map(({ tier }) => (
          <Link
            key={tier}
            to={`/?tier=${tier}`}
            className="group flex flex-col gap-2 bg-paper p-5 transition-colors hover:bg-paper-2"
          >
            <span className="flex items-center gap-2">
              <span className="h-3 w-3" style={{ background: TIER_COLOR[tier] }} />
              <span className="label group-hover:text-ink">{TIER_LABEL[tier]}</span>
            </span>
            <span className="text-[2.5rem] font-extrabold leading-none tabular-nums tracking-[-0.03em]">
              {ferns.length ? tierCounts[tier] : "–"}
            </span>
            <span className="font-mono text-[11px] text-ink-3">species →</span>
          </Link>
        ))}
      </section>

      {/* Status detail, grouped by tier */}
      {GROUPS.map(({ tier, description }) => {
        const rows = STATUS_DETAILS.filter(
          (d) => getStatusMeta(d.name).tier === tier
        );
        return (
          <section key={tier} className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink pb-2">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3" style={{ background: TIER_COLOR[tier] }} />
                <h2 className="text-[1.5rem] font-extrabold tracking-[-0.02em]">
                  {TIER_LABEL[tier]}
                </h2>
              </span>
              <p className="max-w-md text-[13px] text-ink-3">{description}</p>
            </div>

            {rows.map((row) => {
              const meta = getStatusMeta(row.name);
              return (
                <Link
                  key={row.name}
                  to={`/?tier=${tier}`}
                  className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-line py-5 transition-colors hover:bg-paper-2 md:grid-cols-[4rem_1fr_14rem]"
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-[13px] text-ink">
                    <span className="h-2 w-2" style={{ background: TIER_COLOR[tier] }} />
                    {meta.code}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold text-ink group-hover:text-fern">
                      {row.name}
                    </h3>
                    <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-ink-2">
                      {row.summary}
                    </p>
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink-3 md:border-l md:border-line md:pl-4">
                    <span className="label block">Management focus</span>
                    <span className="mt-1 block">{row.focus}</span>
                  </p>
                </Link>
              );
            })}
          </section>
        );
      })}
    </Layout>
  );
}
