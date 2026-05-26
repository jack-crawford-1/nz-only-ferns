import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchFerns } from "../api/fetchFerns";
import { fetchFernByName } from "../api/fetchFernByName";
import type { FernRecord } from "../types/Ferns";
import Layout from "../components/Layout";
import LoadingScreen from "../components/LoadingScreen";
import DistributionMap from "../components/DistributionMap";
import StatusTag from "../components/StatusTag";
import {
  altitudeOf,
  commonNamesOf,
  distributionOf,
  formatBiostatus,
  formatFactValue,
  formatYesNo,
  galleryOf,
  habitatOf,
  statusOf,
} from "../utils/format";

function DataRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-b border-line py-2.5 last:border-b-0">
      <span className="label pt-px">{term}</span>
      <span className="text-[14px] leading-snug text-ink">{children}</span>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-card">
      <div className="border-b border-line px-4 py-2.5">
        <span className="label">{title}</span>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

export default function FernDetail() {
  const { name } = useParams();
  const decodedName = name ? decodeURIComponent(name) : "";

  const [fern, setFern] = useState<FernRecord | null>(null);
  const [allFerns, setAllFerns] = useState<FernRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!decodedName) return;
    setLoading(true);
    fetchFernByName(decodedName)
      .then((data) => setFern(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
    setActiveImg(0);
  }, [decodedName]);

  useEffect(() => {
    fetchFerns()
      .then((data) => setAllFerns(data))
      .catch(() => setAllFerns([]));
  }, []);

  const { prev, next, position } = useMemo(() => {
    const ordered = [...allFerns].sort((a, b) =>
      a.scientificName.localeCompare(b.scientificName)
    );
    const idx = ordered.findIndex((f) => f.scientificName === decodedName);
    return {
      prev: idx > 0 ? ordered[idx - 1] : null,
      next: idx !== -1 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
      position: idx !== -1 ? `${idx + 1} / ${ordered.length}` : null,
    };
  }, [allFerns, decodedName]);

  if (loading) return <LoadingScreen title="Loading species record" />;
  if (error)
    return (
      <Layout>
        <div className="py-20">
          <span className="label text-alert">Error</span>
          <p className="mt-3 text-lg">{error}</p>
        </div>
      </Layout>
    );
  if (!fern)
    return (
      <Layout>
        <div className="py-20">
          <span className="label">Not found</span>
          <p className="mt-3 text-lg">No record for “{decodedName}”.</p>
          <Link to="/" className="link-ink mt-4 inline-block font-medium">
            ← Back to the index
          </Link>
        </div>
      </Layout>
    );

  const gallery = galleryOf(fern);
  const common = commonNamesOf(fern);
  const status = statusOf(fern);

  const narrative = [
    { title: "Distribution", value: distributionOf(fern) },
    { title: "Habitat", value: habitatOf(fern) },
    { title: "Identification", value: fern.recognition },
    { title: "Notes", value: fern.notesText },
  ].filter((s): s is { title: string; value: string } => Boolean(s.value));

  const references: { term: string; value: string }[] = [];
  if (fern.notes?.iNaturalistTaxonId)
    references.push({ term: "iNaturalist", value: fern.notes.iNaturalistTaxonId });
  if (fern.notes?.wikidataId)
    references.push({ term: "Wikidata", value: fern.notes.wikidataId });
  if (fern.source?.publisher)
    references.push({ term: "Publisher", value: fern.source.publisher });
  if (fern.source?.document)
    references.push({ term: "Document", value: fern.source.document });

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4 border-b border-line py-3">
        <Link to="/" className="label hover:text-ink">
          ← Index
        </Link>
        {position ? (
          <span className="font-mono text-[12px] text-ink-3">{position}</span>
        ) : null}
      </div>

      {/* Title band */}
      <header className="border-b-2 border-ink py-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <span className="label">
              {fern.family}
              {fern.id ? ` · № ${fern.id}` : ""}
            </span>
            <h1 className="mt-3 text-[1.9rem] font-extrabold italic leading-[0.98] tracking-[-0.02em] wrap-break-word sm:text-[2.5rem] md:text-[3.75rem]">
              {fern.scientificName}
            </h1>
            {fern.authorship ? (
              <p className="mt-2 font-mono text-[13px] text-ink-3">
                {fern.authorship}
              </p>
            ) : null}
            {common ? (
              <p className="mt-3 text-[15px] text-ink-2">{common}</p>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-2">
            <StatusTag status={status} />
            <div className="flex gap-2">
              {fern.isEndemic ? (
                <span className="border border-fern px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-fern">
                  Endemic
                </span>
              ) : null}
              {fern.isNative ? (
                <span className="border border-line-2 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-ink-2">
                  Native
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="grid gap-10 py-10 lg:grid-cols-[1.35fr_1fr]">
        {/* Plates + map */}
        <div className="flex flex-col gap-6">
          <div className="border border-line bg-card p-3">
            <div className="aspect-4/3 overflow-hidden bg-paper-2">
              {gallery.length > 0 ? (
                <img
                  src={gallery[activeImg]}
                  alt={`${fern.scientificName}, plate ${activeImg + 1}`}
                  className="h-full w-full object-cover"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-[12px] text-ink-3">
                  No plate available
                </div>
              )}
            </div>
            {gallery.length > 1 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {gallery.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    onClick={() => setActiveImg(i)}
                    className={`h-14 w-14 overflow-hidden border ${
                      i === activeImg ? "border-fern" : "border-line"
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex items-center justify-between">
              <span className="label">Plate</span>
              <span className="font-mono text-[11px] text-ink-3">
                {gallery.length > 0
                  ? `${activeImg + 1} / ${gallery.length}`
                  : "–"}
              </span>
            </div>
          </div>

          <div className="border border-line bg-card p-3">
            <DistributionMap distributionText={distributionOf(fern)} />
          </div>
        </div>

        {/* Data */}
        <div className="flex flex-col gap-6">
          <Panel title="Field data">
            <DataRow term="Family">{fern.family}</DataRow>
            <DataRow term="Status">
              <StatusTag status={status} />
            </DataRow>
            <DataRow term="Biostatus">{formatBiostatus(fern.biostatus)}</DataRow>
            <DataRow term="Altitude">{altitudeOf(fern) || "–"}</DataRow>
            <DataRow term="Endemic">{formatYesNo(fern.isEndemic)}</DataRow>
            <DataRow term="Native">{formatYesNo(fern.isNative)}</DataRow>
          </Panel>

          <Panel title="Taxonomy">
            <DataRow term="Rank">{formatFactValue(fern.rank)}</DataRow>
            <DataRow term="Genus">{formatFactValue(fern.genus)}</DataRow>
            <DataRow term="Epithet">
              {formatFactValue(fern.specificEpithet)}
            </DataRow>
            <DataRow term="Order">{formatFactValue(fern.order)}</DataRow>
            <DataRow term="Class">{formatFactValue(fern.class)}</DataRow>
            <DataRow term="Subphylum">{formatFactValue(fern.subphylum)}</DataRow>
          </Panel>

          {fern.synonyms && fern.synonyms.length > 0 ? (
            <Panel title="Synonyms">
              <ul className="py-2">
                {fern.synonyms.map((syn) => (
                  <li
                    key={syn}
                    className="border-b border-line py-1.5 text-[14px] italic text-ink-2 last:border-b-0"
                  >
                    {syn}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {references.length > 0 ? (
            <Panel title="References">
              {references.map((r) => (
                <DataRow key={r.term} term={r.term}>
                  <span className="font-mono text-[13px]">{r.value}</span>
                </DataRow>
              ))}
            </Panel>
          ) : null}
        </div>
      </div>

      {/* Narrative */}
      {narrative.length > 0 ? (
        <section className="border-t-2 border-ink">
          {narrative.map((s) => (
            <div
              key={s.title}
              className="grid gap-2 border-b border-line py-7 md:grid-cols-[10rem_1fr] md:gap-10"
            >
              <span className="label pt-1">{s.title}</span>
              <p className="max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-ink-2">
                {s.value}
              </p>
            </div>
          ))}
        </section>
      ) : (
        <section className="border-t-2 border-ink py-10">
          <p className="text-[14px] text-ink-3">
            No extended field notes are recorded for this species yet.
          </p>
        </section>
      )}

      {/* Prev / next */}
      <nav className="grid grid-cols-2 gap-px border border-line bg-line">
        {prev ? (
          <Link
            to={`/ferns/${encodeURIComponent(prev.scientificName)}`}
            className="group flex flex-col gap-1 bg-paper px-5 py-5 transition-colors hover:bg-paper-2"
          >
            <span className="label">← Previous</span>
            <span className="text-[15px] italic text-ink group-hover:text-fern">
              {prev.scientificName}
            </span>
          </Link>
        ) : (
          <span className="bg-paper px-5 py-5">
            <span className="label text-ink-3">← Previous</span>
          </span>
        )}
        {next ? (
          <Link
            to={`/ferns/${encodeURIComponent(next.scientificName)}`}
            className="group flex flex-col items-end gap-1 bg-paper px-5 py-5 text-right transition-colors hover:bg-paper-2"
          >
            <span className="label">Next →</span>
            <span className="text-[15px] italic text-ink group-hover:text-fern">
              {next.scientificName}
            </span>
          </Link>
        ) : (
          <span className="bg-paper px-5 py-5 text-right">
            <span className="label text-ink-3">Next →</span>
          </span>
        )}
      </nav>
    </Layout>
  );
}
