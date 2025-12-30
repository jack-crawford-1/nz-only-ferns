import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import { fetchFernByName } from "../api/fetchFernByName";
import type { FernRecord } from "../types/Ferns";
import Navbar from "../components/nav/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import DistributionMap from "../components/DistributionMap";

export default function FernDetail() {
  const { name } = useParams();
  const decodedName = name ? decodeURIComponent(name) : "";

  const [fern, setFern] = useState<FernRecord | null>(null);
  const [allFerns, setAllFerns] = useState<FernRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decodedName) return;

    fetchFernByName(decodedName)
      .then((data) => setFern(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [decodedName]);

  useEffect(() => {
    fetchFerns()
      .then((data) => setAllFerns(data))
      .catch(() => {
        setAllFerns([]);
      });
  }, []);

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

  const quickFacts = [
    { label: "Family", value: fern.family },
    {
      label: "Conservation status",
      value: fern.conservationStatus || "Unknown",
    },
    { label: "Biostatus", value: fern.biostatus || "Not recorded" },
    {
      label: "Altitudinal range",
      value: fern.altitudinalRange || "Not recorded",
    },
    { label: "Endemic to NZ?", value: fern.isEndemic ? "Yes" : "No" },
    { label: "Native to NZ?", value: fern.isNative ? "Yes" : "No" },
  ];

  const detailSections = [
    { title: "Distribution", value: fern.distribution },
    { title: "Habitat", value: fern.habitat },
    { title: "Identification", value: fern.recognition },
    { title: "Notes", value: fern.notes },
  ].filter((section): section is { title: string; value: string } =>
    Boolean(section.value)
  );
  const galleryImages =
    fern.imageUrls && fern.imageUrls.length > 0
      ? fern.imageUrls
      : fern.imageUrl
      ? [fern.imageUrl]
      : [];
  const sourceUrl =
    "http://datastore.landcareresearch.co.nz/dataset/nzflora-brownsey-perrie-2021-pteridaceae/resource/97215842-8ecc-4067-a7a6-fc18250f6fc9";

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
    <div className="min-h-screen bg-radial-to-b from-[#e9f3ff] via-white to-[#f6f8fb]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-32">
        <section className="mb-8 flex flex-col gap-6 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1967d2]">
                Fern profile
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                {fern.scientificName}
              </h1>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">
                  Common names:{" "}
                </span>
                {fern.commonNames.length > 0
                  ? fern.commonNames.join(", ")
                  : "Not recorded"}
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    fern.isEndemic
                      ? "bg-[#e0edff] text-[#1e60d4]"
                      : "bg-[#eef2f7] text-[#64748b]"
                  }`}
                >
                  {fern.isEndemic ? "Endemic" : "Not endemic"}
                </span>
              </div>
            </div>
            <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-100">
              {galleryImages.length > 0 ? (
                <div
                  className={`grid gap-2 ${
                    galleryImages.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {galleryImages.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={url}
                      alt={`${fern.scientificName} photo ${index + 1}`}
                      className={`w-full rounded-xl object-cover ${
                        galleryImages.length > 1 ? "h-28 sm:h-32" : "h-64"
                      }`}
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-xl bg-[#f3f6ff] text-sm text-gray-500">
                  No image available
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl bg-[#f3f6ff] px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1e60d4]">
                  {fact.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/">
              <button className="rounded-full bg-[#1e60d4] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0f4fa4] hover:shadow-xl">
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
                  <button className="rounded-full border border-[#c6d9ff] bg-white px-4 py-2 text-sm font-semibold text-[#1e60d4] shadow-sm transition hover:border-[#1e60d4]">
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
                  <button className="rounded-full border border-[#c6d9ff] bg-white px-4 py-2 text-sm font-semibold text-[#1e60d4] shadow-sm transition hover:border-[#1e60d4]">
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
          {detailSections.map((section, index) => (
            <article
              key={section.title}
              className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 "
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {index === 0 && (
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-[#c6d9ff] bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1e60d4] transition hover:border-[#1e60d4]"
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Extended Notes Source
                  </a>
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>
              {section.title === "Distribution" ? (
                <div className="mt-4 flex flex-col gap-4 lg:flex-row">
                  <div className="lg:w-3/5">
                    <p className="whitespace-pre-line text-sm text-gray-600">
                      {section.value}
                    </p>
                  </div>
                  <div className="lg:w-2/5">
                    <DistributionMap distributionText={section.value} />
                  </div>
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-line text-sm text-gray-600">
                  {section.value}
                </p>
              )}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
