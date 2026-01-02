import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";
import Navbar from "../components/nav/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import Footer from "../components/Footer";
import { convertToCSV, downloadCSV } from "../utils/csv";

const renderFernImage = (fern: FernRecord) =>
  fern.imageUrl ? (
    <img
      src={fern.imageUrl}
      alt={fern.scientificName}
      className="h-full w-full rounded-2xl border border-[#e2e8e0] object-cover shadow-sm"
      loading="lazy"
      decoding="async"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#f3f7f4] text-xs text-gray-500 shadow-inner">
      No image
    </div>
  );

export default function FernList() {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "";
  const [ferns, setFerns] = useState<FernRecord[]>([]);
  const [filteredFerns, setFilteredFerns] = useState<FernRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEndemicOnly, setShowEndemicOnly] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const familyOptions = useMemo(
    () => Array.from(new Set(ferns.map((fern) => fern.family))).sort(),
    [ferns]
  );
  const statusOptions = useMemo(() => {
    const statuses = ferns.map((fern) => fern.conservationStatus || "Unknown");
    return Array.from(new Set(statuses)).sort();
  }, [ferns]);

  useEffect(() => {
    setSelectedStatus(statusParam);
  }, [statusParam]);

  useEffect(() => {
    fetchFerns()
      .then((data) => {
        setFerns(data);
        setFilteredFerns(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    setFilteredFerns(
      ferns.filter((fern) => {
        if (showEndemicOnly && !fern.isEndemic) return false;

        if (selectedFamily && fern.family !== selectedFamily) return false;

        const statusLabel = fern.conservationStatus || "Unknown";
        if (selectedStatus && statusLabel !== selectedStatus) return false;

        if (!query) return true;

        const searchableValues = [
          fern.scientificName,
          fern.commonNames.join(" "),
          fern.family,
          fern.conservationStatus || "",
          fern.isEndemic ? "yes" : "no",
        ]
          .join(" ")
          .toLowerCase();

        return searchableValues.includes(query);
      })
    );
  }, [ferns, searchQuery, showEndemicOnly, selectedFamily, selectedStatus]);

  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
  if (isLoading)
    return (
      <LoadingScreen title="Loading fern library" description="..........." />
    );

  const handleExport = () => {
    const csv = convertToCSV(ferns);
    const today = new Date().toLocaleDateString().split("T")[0];
    downloadCSV(csv, `ferns-${today}.csv`);
  };

  return (
    <div className="min-h-screen bg-[#22342606]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-12 pt-32">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Explore Aotearoa’s native ferns
              </h1>
              <div className="relative w-full max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search ferns, families, or status"
                  className="w-full rounded-full border border-transparent bg-[#f3f7f4] px-9 py-2 text-sm text-gray-800 shadow-inner ring-1 ring-transparent transition focus:border-[#1f4d3a] focus:ring-[#c7d9cf]"
                  aria-label="Filter fern rows"
                />
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-full bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#143324] hover:shadow-xl"
            >
              <span>Export to CSV</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-10 items-center justify-center rounded-full bg-[#e2f0e8] font-semibold text-[#1f4d3a] ">
                {filteredFerns.length}
              </span>
              <span className="font-medium">Ferns visible</span>
            </div>
            <span
              className="hidden h-4 w-px bg-gray-200 sm:inline-block"
              aria-hidden
            />
            <button
              type="button"
              onClick={() => setShowEndemicOnly((prev) => !prev)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                showEndemicOnly
                  ? "bg-[#1f4d3a] text-white shadow-sm"
                  : "bg-white text-[#1f4d3a] shadow-sm ring-1 ring-[#c7d9cf]"
              }`}
            >
              Endemic only
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Status
              </label>
              <select
                className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f4d3a] shadow-sm ring-1 ring-[#c7d9cf]"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                <option value="">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                Family
              </label>
              <select
                className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f4d3a] shadow-sm ring-1 ring-[#c7d9cf]"
                value={selectedFamily}
                onChange={(event) => setSelectedFamily(event.target.value)}
              >
                <option value="">All</option>
                {familyOptions.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredFerns.length === 0 ? (
            <div className="rounded-2xl bg-white/80 px-4 py-6 text-center text-sm text-gray-600 shadow-lg ring-1 ring-gray-100 backdrop-blur sm:col-span-2 xl:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1f4d3a]">
                No results
              </p>
              <p className="mt-2">
                No ferns match your search yet. Try another name or status.
              </p>
            </div>
          ) : (
            filteredFerns.map((fern) => {
              const commonNames =
                fern.commonNames.length > 0
                  ? fern.commonNames.join(", ")
                  : "Not recorded";
              const quickFacts = [
                { label: "Family", value: fern.family },
                {
                  label: "Status",
                  value: fern.conservationStatus || "Unknown",
                },
              ];

              return (
                <article
                  key={fern.scientificName}
                  className="flex h-full flex-col rounded-2xl bg-white/80 p-5 shadow-lg ring-1 ring-gray-100 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="flex h-full flex-col gap-4">
                    <Link
                      to={`/ferns/${encodeURIComponent(fern.scientificName)}`}
                      className="block aspect-[4/3] overflow-hidden rounded-2xl"
                      aria-label={`View ${fern.scientificName}`}
                    >
                      {renderFernImage(fern)}
                    </Link>

                    <div className="flex flex-1 flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <h2
                          className="text-2xl text-gray-900"
                          style={{ fontFamily: "Cormorant Garamond" }}
                        >
                          <Link
                            to={`/ferns/${encodeURIComponent(
                              fern.scientificName
                            )}`}
                            className="hover:text-[#1f4d3a]"
                          >
                            {fern.scientificName}
                          </Link>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                              fern.isEndemic
                                ? "bg-[#e2f0e8] text-[#1f4d3a]"
                                : "bg-[#eef2f7] text-[#64748b]"
                            }`}
                          >
                            {fern.isEndemic ? "Endemic" : "Not endemic"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                              fern.isNative
                                ? "bg-[#e2f0e8] text-[#1f4d3a]"
                                : "bg-[#eef2f7] text-[#64748b]"
                            }`}
                          >
                            {fern.isNative ? "Native" : "Not native"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">
                            Common names:{" "}
                          </span>
                          {commonNames}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        {quickFacts.map((fact) => (
                          <p key={fact.label} className="leading-snug">
                            <span className="font-semibold uppercase tracking-[0.16em] text-[#1f4d3a]">
                              {fact.label}
                            </span>
                            <span className="px-1 text-gray-400">·</span>
                            <span className="font-semibold text-gray-800">
                              {fact.value}
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
