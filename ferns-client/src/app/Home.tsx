import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";
import Layout from "../components/Layout";
import LoadingScreen from "../components/LoadingScreen";
import StatusTag from "../components/StatusTag";
import { convertToCSV, downloadCSV } from "../utils/csv";
import {
  commonNamesOf,
  formatBiostatus,
  getStatusMeta,
  primaryImageOf,
  statusOf,
  TIER_RANK,
  type StatusTier,
} from "../utils/format";

type SortKey = "name" | "family" | "status";
type ViewMode = "index" | "plates";

const TIER_OPTIONS: { value: "" | StatusTier; label: string }[] = [
  { value: "", label: "All status" },
  { value: "threatened", label: "Threatened" },
  { value: "at-risk", label: "At risk" },
  { value: "stable", label: "Not threatened" },
  { value: "unknown", label: "Unassessed" },
];

const speciesEpithet = (name: string) => {
  const parts = name.split(" ");
  return { genus: parts[0] ?? name, rest: parts.slice(1).join(" ") };
};

function Caret() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 font-mono text-[10px] text-ink-3"
    >
      ▾
    </span>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer border-b border-line-2 bg-transparent py-1.5 pr-5 text-[14px] text-ink hover:border-ink focus:border-fern focus:outline-none"
        >
          {children}
        </select>
        <Caret />
      </span>
    </label>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ferns, setFerns] = useState<FernRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const view: ViewMode = searchParams.get("view") === "plates" ? "plates" : "index";
  const setView = (mode: ViewMode) => {
    const next = new URLSearchParams(searchParams);
    if (mode === "plates") next.set("view", "plates");
    else next.delete("view");
    setSearchParams(next, { replace: true });
  };
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("");
  const [endemicOnly, setEndemicOnly] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });

  // Tier from URL (?tier=…) with legacy ?status=<label> support.
  const tier = useMemo<"" | StatusTier>(() => {
    const t = searchParams.get("tier");
    if (t) return t as StatusTier;
    const legacy = searchParams.get("status");
    if (legacy) return getStatusMeta(legacy).tier;
    return "";
  }, [searchParams]);

  const setTier = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("tier", value);
    else next.delete("tier");
    next.delete("status");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    fetchFerns()
      .then((data: FernRecord[]) => setFerns(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const familyOptions = useMemo(
    () => Array.from(new Set(ferns.map((f) => f.family).filter(Boolean))).sort(),
    [ferns]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = ferns.filter((fern) => {
      if (endemicOnly && !fern.isEndemic) return false;
      if (family && fern.family !== family) return false;
      if (tier && getStatusMeta(statusOf(fern)).tier !== tier) return false;
      if (!q) return true;
      const haystack = [
        fern.scientificName,
        fern.commonNames?.join(" "),
        fern.family,
        fern.genus,
        statusOf(fern),
        formatBiostatus(fern.biostatus),
        fern.synonyms?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    const dir = sort.dir === "asc" ? 1 : -1;
    result.sort((a, b) => {
      if (sort.key === "family") {
        const fa = (a.family || "").localeCompare(b.family || "");
        return fa !== 0 ? fa * dir : a.scientificName.localeCompare(b.scientificName);
      }
      if (sort.key === "status") {
        const ra = TIER_RANK[getStatusMeta(statusOf(a)).tier];
        const rb = TIER_RANK[getStatusMeta(statusOf(b)).tier];
        return ra !== rb
          ? (ra - rb) * dir
          : a.scientificName.localeCompare(b.scientificName);
      }
      return a.scientificName.localeCompare(b.scientificName) * dir;
    });
    return result;
  }, [ferns, query, family, tier, endemicOnly, sort]);

  if (error)
    return (
      <Layout>
        <div className="py-20">
          <span className="label text-alert">Error</span>
          <p className="mt-3 text-lg">{error}</p>
        </div>
      </Layout>
    );
  if (isLoading) return <LoadingScreen />;

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );

  const sortMark = (key: SortKey) =>
    sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : "";

  const handleExport = () => {
    const csv = convertToCSV(filtered);
    downloadCSV(csv, `pteridophyta-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <Layout>
      {/* Masthead */}
      <section className="border-b border-line py-12 md:py-16">
        <div className="flex items-start justify-between gap-8">
          <div>
            <span className="label">Aotearoa New Zealand · Pteridophyta</span>
            <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[0.93] tracking-[-0.03em] md:text-[4.75rem]">
              Ferns &amp; lycophytes
              <br />
              of Aotearoa
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-2">
              A working index of the native and endemic species of these
              islands, their taxonomy, conservation status, and distribution,
              gathered from the public botanical record.
            </p>
          </div>
          <div className="hidden shrink-0 text-right md:block">
            <div className="label">Records</div>
            <div className="mt-2 text-[4rem] font-extrabold leading-none tabular-nums tracking-[-0.03em]">
              {ferns.length}
            </div>
            <div className="mt-2 font-mono text-[12px] text-ink-3">
              {familyOptions.length} families
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/identify"
            className="bg-ink px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-paper transition-colors hover:bg-fern"
          >
            Identify a fern →
          </Link>
          <button
            onClick={handleExport}
            className="border border-line-2 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-ink transition-colors hover:border-ink"
          >
            Export CSV
          </button>
        </div>
      </section>

      {/* Controls */}
      <section className="flex flex-col gap-5 border-b border-line py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex border border-line-2">
            {(["index", "plates"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.04em] transition-colors ${
                  view === mode
                    ? "bg-ink text-paper"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <span className="font-mono text-[12px] text-ink-3">
            {filtered.length} / {ferns.length} species
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <label className="flex flex-col gap-1">
            <span className="label">Search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, family, synonym…"
              className="w-full border-b border-line-2 bg-transparent py-1.5 text-[14px] text-ink placeholder:text-ink-3 hover:border-ink focus:border-fern focus:outline-none"
            />
          </label>

          <SelectField label="Family" value={family} onChange={setFamily}>
            <option value="">All families</option>
            {familyOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </SelectField>

          <SelectField label="Status" value={tier} onChange={setTier}>
            {TIER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>

          <div className="flex flex-col gap-1">
            <span className="label">Filter</span>
            <button
              onClick={() => setEndemicOnly((v) => !v)}
              className="flex items-center gap-2 py-1.5 text-[14px] text-ink"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center border ${
                  endemicOnly
                    ? "border-fern bg-fern text-paper"
                    : "border-line-2"
                }`}
              >
                {endemicOnly ? "✓" : ""}
              </span>
              Endemic only
            </button>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <span className="label">No matches</span>
          <p className="mt-3 text-lg text-ink-2">
            No species match these filters.
          </p>
        </div>
      ) : view === "index" ? (
        <IndexTable
          ferns={filtered}
          toggleSort={toggleSort}
          sortMark={sortMark}
        />
      ) : (
        <PlatesGrid ferns={filtered} />
      )}
    </Layout>
  );
}

/* ------------------------------ Index table ----------------------------- */

function IndexTable({
  ferns,
  toggleSort,
  sortMark,
}: {
  ferns: FernRecord[];
  toggleSort: (k: SortKey) => void;
  sortMark: (k: SortKey) => string;
}) {
  return (
    <section className="pb-4">
      {/* Header (desktop) */}
      <div className="hidden grid-cols-[3rem_minmax(0,2.4fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_auto] items-center gap-x-4 border-b-2 border-ink py-2.5 md:grid">
        <span className="label">№</span>
        <button
          onClick={() => toggleSort("name")}
          className="label flex items-center gap-1 text-left hover:text-ink"
        >
          Species {sortMark("name")}
        </button>
        <span className="label">Common name</span>
        <button
          onClick={() => toggleSort("family")}
          className="label flex items-center gap-1 text-left hover:text-ink"
        >
          Family {sortMark("family")}
        </button>
        <button
          onClick={() => toggleSort("status")}
          className="label flex items-center gap-1 justify-self-end hover:text-ink"
        >
          Status {sortMark("status")}
        </button>
      </div>

      {ferns.map((fern, i) => {
        const { genus, rest } = speciesEpithet(fern.scientificName);
        const common = commonNamesOf(fern);
        return (
          <Link
            key={fern.scientificName}
            to={`/ferns/${encodeURIComponent(fern.scientificName)}`}
            className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-4 gap-y-0.5 border-b border-line py-3 transition-colors hover:bg-paper-2 md:grid-cols-[3rem_minmax(0,2.4fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_auto]"
          >
            <span className="font-mono text-[12px] text-ink-3">
              {String(i + 1).padStart(3, "0")}
            </span>

            <span className="min-w-0">
              <span className="text-[16px] italic leading-tight text-ink group-hover:text-fern">
                <span className="font-semibold not-italic">{genus}</span>{" "}
                {rest}
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-ink-3 md:hidden">
                {fern.family}
                {common ? ` · ${common}` : ""}
              </span>
            </span>

            <span className="hidden min-w-0 truncate text-[13px] text-ink-2 md:block">
              {common || "–"}
            </span>
            <span className="hidden min-w-0 truncate text-[13px] text-ink-2 md:block">
              {fern.family}
            </span>

            <span className="flex items-center gap-2 justify-self-end">
              {fern.isEndemic ? (
                <span className="font-mono text-[11px] tracking-wide text-fern">
                  END
                </span>
              ) : null}
              <StatusTag status={statusOf(fern)} variant="code" />
            </span>
          </Link>
        );
      })}
    </section>
  );
}

/* ------------------------------ Plates grid ----------------------------- */

function PlatesGrid({ ferns }: { ferns: FernRecord[] }) {
  return (
    <section className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 xl:grid-cols-4">
      {ferns.map((fern, i) => {
        const img = primaryImageOf(fern);
        const { genus, rest } = speciesEpithet(fern.scientificName);
        return (
          <Link
            key={fern.scientificName}
            to={`/ferns/${encodeURIComponent(fern.scientificName)}`}
            className="group flex flex-col bg-paper p-4 transition-colors hover:bg-card"
          >
            <div className="relative aspect-4/5 overflow-hidden border border-line bg-paper-2">
              {img ? (
                <img
                  src={img}
                  alt={fern.scientificName}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-[11px] text-ink-3">
                  No plate
                </div>
              )}
              <span className="absolute left-0 top-0 bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-3">
                {String(i + 1).padStart(3, "0")}
              </span>
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <span className="text-[15px] italic leading-tight text-ink group-hover:text-fern">
                <span className="font-semibold not-italic">{genus}</span> {rest}
              </span>
              <StatusTag status={statusOf(fern)} variant="code" />
            </div>
            <span className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-3">
              {fern.family}
            </span>
          </Link>
        );
      })}
    </section>
  );
}
