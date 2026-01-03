import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import { fetchFernByName } from "../api/fetchFernByName";
import type { FernRecord } from "../types/Ferns";
import Navbar from "../components/nav/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import DistributionMap from "../components/DistributionMap";
import Footer from "../components/Footer";

const formatTitleCase = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const formatBiostatus = (
  biostatus: FernRecord["biostatus"] | string | null | undefined
) => {
  if (!biostatus) return "Not recorded";
  if (typeof biostatus === "string") return biostatus;

  const parts: string[] = [];
  if (biostatus.origin) parts.push(formatTitleCase(biostatus.origin));
  if (biostatus.occurrence) parts.push(formatTitleCase(biostatus.occurrence));
  if (biostatus.endemicToNZ === true) parts.push("Endemic");
  if (biostatus.endemicToNZ === false) parts.push("Not endemic");

  return parts.length ? parts.join(" · ") : "Not recorded";
};

const formatYesNo = (value: boolean | null | undefined) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Unknown";
};

const formatFactValue = (value: unknown) => {
  if (value === null || value === undefined) return "Not recorded";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join(", ");
    return joined || "Not recorded";
  }
  if (typeof value === "object") {
    return formatBiostatus(value as FernRecord["biostatus"]);
  }
  return String(value);
};

export default function FernDetail() {
  const { name } = useParams();
  const decodedName = name ? decodeURIComponent(name) : "";

  const [fern, setFern] = useState<FernRecord | null>(null);
  const [allFerns, setAllFerns] = useState<FernRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryPage, setGalleryPage] = useState(0);

  useEffect(() => {
    if (!decodedName) return;

    fetchFernByName(decodedName)
      .then((data) => setFern(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [decodedName]);

  useEffect(() => {
    if (!decodedName) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [decodedName]);

  useEffect(() => {
    fetchFerns()
      .then((data) => setAllFerns(data))
      .catch(() => {
        setAllFerns([]);
      });
  }, []);

  useEffect(() => {
    setGalleryPage(0);
  }, [fern?.scientificName]);

  if (loading)
    return (
      <LoadingScreen
        title="Loading fern profile"
        description="Pulling the latest details for this fern."
      />
    );
  if (error)
    return <p className="text-red-500 text-center mt-10">Error: {error}</p>;
  if (!fern) return <p className="text-center mt-10">Fern not found.</p>;

  const IMAGES_PER_PAGE = 4;
  const commonNames =
    fern.commonNames && fern.commonNames.length > 0
      ? fern.commonNames.join(", ")
      : "Not recorded";
  const conservationStatus =
    fern.conservationStatus ?? fern.notes?.conservationStatus ?? null;
  const altitudinalRange =
    fern.altitudinalRange ?? fern.notes?.altitudinalRange ?? null;
  const distribution = fern.distribution ?? fern.notes?.distributionNZ ?? null;
  const habitat = fern.habitat ?? fern.notes?.habitat ?? null;
  const notesText = fern.notesText ?? null;
  const biostatusLabel = formatBiostatus(fern.biostatus);
  const endemicLabel = formatYesNo(fern.isEndemic);
  const nativeLabel = formatYesNo(fern.isNative);
  const synonyms = fern.synonyms?.filter(Boolean) ?? [];
  const synonymsText = synonyms.length ? synonyms.join(", ") : "None recorded";
  const sourceText =
    [fern.source?.document, fern.source?.publisher]
      .filter(Boolean)
      .join(" · ") || "Not recorded";
  const externalIds: string[] = [];

  if (fern.notes?.iNaturalistTaxonId) {
    externalIds.push(`iNaturalist: ${fern.notes.iNaturalistTaxonId}`);
  }
  if (fern.notes?.wikidataId) {
    externalIds.push(`Wikidata: ${fern.notes.wikidataId}`);
  }

  const externalIdsText = externalIds.length
    ? externalIds.join(" · ")
    : "Not recorded";
  const endemicBadge =
    fern.isEndemic === true
      ? { label: "Endemic", className: "bg-[#e2f0e8] text-[#1f4d3a]" }
      : fern.isEndemic === false
      ? { label: "Not endemic", className: "bg-[#eef2f7] text-[#64748b]" }
      : { label: "Endemic unknown", className: "bg-[#f8fafc] text-[#94a3b8]" };
  const quickFacts = [
    { label: "Family", value: fern.family },
    {
      label: "Conservation status",
      value: conservationStatus || "Unknown",
    },
    { label: "Biostatus", value: biostatusLabel },
    {
      label: "Altitudinal range",
      value: altitudinalRange || "Not recorded",
    },
    { label: "Endemic to NZ?", value: endemicLabel },
    { label: "Native to NZ?", value: nativeLabel },
  ];
  const taxonomyFacts = [
    { label: "Rank", value: fern.rank || "Not recorded" },
    { label: "Genus", value: fern.genus || "Not recorded" },
    {
      label: "Specific epithet",
      value: fern.specificEpithet || "Not recorded",
    },
    { label: "Authorship", value: fern.authorship || "Not recorded" },
    { label: "Order", value: fern.order || "Not recorded" },
    { label: "Class", value: fern.class || "Not recorded" },
    { label: "Subphylum", value: fern.subphylum || "Not recorded" },
    { label: "Catalogue ID", value: fern.id || "Not recorded" },
  ];
  const referenceFacts = [
    { label: "Synonyms", value: synonymsText },
    { label: "Source", value: sourceText },
    { label: "External IDs", value: externalIdsText },
  ];

  const detailSections = [
    { title: "Distribution", value: distribution },
    { title: "Habitat", value: habitat },
    { title: "Identification", value: fern.recognition },
    { title: "Notes", value: notesText },
  ].filter((section): section is { title: string; value: string } =>
    Boolean(section.value)
  );
  const galleryImages =
    fern.imageUrls && fern.imageUrls.length > 0
      ? fern.imageUrls
      : fern.imageUrl
      ? [fern.imageUrl]
      : [];
  const distributionText = distribution ?? "";
  const galleryPageCount = Math.ceil(galleryImages.length / IMAGES_PER_PAGE);
  const galleryStart = galleryPage * IMAGES_PER_PAGE;
  const galleryEnd = Math.min(
    galleryStart + IMAGES_PER_PAGE,
    galleryImages.length
  );
  const galleryPageImages = galleryImages.slice(
    galleryStart,
    galleryStart + IMAGES_PER_PAGE
  );
  const canGoPrev = galleryPage > 0;
  const canGoNext = galleryPage + 1 < galleryPageCount;

  const orderedFerns = [...allFerns].sort((a, b) =>
    a.scientificName.localeCompare(b.scientificName)
  );
  const currentIndex = orderedFerns.findIndex(
    (record) => record.scientificName === fern.scientificName
  );
  const previousFern = currentIndex > 0 ? orderedFerns[currentIndex - 1] : null;
  const nextFern =
    currentIndex !== -1 && currentIndex < orderedFerns.length - 1
      ? orderedFerns[currentIndex + 1]
      : null;

  return (
    <div className=" h-screen bg-[#22342606]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-32">
        <section className="mb-8 flex flex-col gap-5 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#20624a]">
                Fern profile
              </p>
              <h1
                className="text-4xl  text-gray-900"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                {fern.scientificName}
              </h1>
              {fern.authorship ? (
                <p className="text-sm text-gray-500 italic">
                  {fern.authorship}
                </p>
              ) : null}
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">
                  Common names:{" "}
                </span>
                {commonNames}
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] mb-4 ${endemicBadge.className}`}
                >
                  {endemicBadge.label}
                </span>
              </div>
            </div>

            <div className="lg:row-span-2 lg:flex md:items-end md:justify-center pt-10">
              <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-100 ">
                {galleryImages.length > 0 ? (
                  <>
                    <div
                      className={`grid gap-2 ${
                        galleryPageImages.length > 1
                          ? "grid-cols-1"
                          : "grid-cols-1"
                      }`}
                    >
                      {galleryPageImages.map((url, index) => (
                        <img
                          key={`${url}-${galleryStart + index}`}
                          src={url}
                          alt={`${fern.scientificName} photo ${
                            galleryStart + index + 1
                          }`}
                          className={`w-full rounded-xl object-cover ${
                            galleryPageImages.length > 1
                              ? "h-28 sm:h-20"
                              : "h-64"
                          }`}
                          loading="lazy"
                          decoding="async"
                        />
                      ))}
                    </div>
                    {galleryPageCount > 1 ? (
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-500">
                          Showing {galleryStart + 1}-{galleryEnd} of{" "}
                          {galleryImages.length}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                              canGoPrev
                                ? "border-[#c7d9cf] bg-white text-[#1f4d3a] hover:border-[#1f4d3a]"
                                : "cursor-not-allowed border-gray-200 bg-white text-gray-400"
                            }`}
                            type="button"
                            onClick={() =>
                              setGalleryPage((page) => Math.max(page - 1, 0))
                            }
                            disabled={!canGoPrev}
                          >
                            Previous
                          </button>
                          <button
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                              canGoNext
                                ? "border-[#c7d9cf] bg-white text-[#1f4d3a] hover:border-[#1f4d3a]"
                                : "cursor-not-allowed border-gray-200 bg-white text-gray-400"
                            }`}
                            type="button"
                            onClick={() =>
                              setGalleryPage((page) =>
                                Math.min(page + 1, galleryPageCount - 1)
                              )
                            }
                            disabled={!canGoNext}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="flex h-64 w-full items-center justify-center rounded-xl bg-[#f3f7f4] text-sm text-gray-500">
                    No image available
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-xs rounded-2xl bg-white p-0 shadow-lg ring-1 ring-gray-100">
              <DistributionMap distributionText={distributionText} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl bg-[#f3f7f4] px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                  {fact.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {formatFactValue(fact.value)}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="mt-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {taxonomyFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-xl bg-[#f3f7f4] px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {formatFactValue(fact.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/ferns">
              <button className="rounded-full bg-[#1f4d3a] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#143324] hover:shadow-xl">
                Back to fern list
              </button>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              {previousFern ? (
                <Link
                  to={`/ferns/${encodeURIComponent(
                    previousFern.scientificName
                  )}`}
                >
                  <button className="rounded-full border border-[#c7d9cf] bg-white px-4 py-2 text-sm font-semibold text-[#1f4d3a] shadow-sm transition hover:border-[#1f4d3a]">
                    Previous
                  </button>
                </Link>
              ) : (
                <button
                  className="cursor-not-allowed rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-400"
                  disabled
                >
                  Previous
                </button>
              )}
              {nextFern ? (
                <Link
                  to={`/ferns/${encodeURIComponent(nextFern.scientificName)}`}
                >
                  <button className="rounded-full border border-[#c7d9cf] bg-white px-4 py-2 text-sm font-semibold text-[#1f4d3a] shadow-sm transition hover:border-[#1f4d3a]">
                    Next
                  </button>
                </Link>
              ) : (
                <button
                  className="cursor-not-allowed rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-400"
                  disabled
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {detailSections.length === 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
              <p className="text-sm text-gray-600">
                No extended notes are available yet for this fern.
              </p>
            </div>
          )}
          {detailSections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 "
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>

              <div className="mt-4 flex flex-col gap-4 lg:flex-row">
                <div className="">
                  <p className="whitespace-pre-line text-sm text-gray-600">
                    {section.value}'
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <Footer />
      </main>
    </div>
  );
}
