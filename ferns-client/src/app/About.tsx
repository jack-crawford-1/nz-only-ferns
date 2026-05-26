import { Link } from "react-router";
import Layout from "../components/Layout";

const SOURCES = [
  { name: "New Zealand Plant Conservation Network (NZPCN)", href: "https://www.nzpcn.org.nz/", label: "nzpcn.org.nz" },
  { name: "NZFlora / Landcare Research", href: "https://nzflora.landcareresearch.co.nz/", label: "nzflora.landcareresearch.co.nz" },
  { name: "Global Biodiversity Information Facility (GBIF)", href: "https://www.gbif.org/", label: "gbif.org" },
  { name: "Department of Conservation, NZ Threat Classification System", href: "https://www.doc.govt.nz/nature/biodiversity/nz-threat-classification-system/", label: "doc.govt.nz" },
  { name: "Brownsey, P. J. & Perrie, L. R. (2015). New Zealand Ferns and Lycophytes: A Guide to Species. Te Papa Press.", href: "https://datastore.landcareresearch.co.nz/dataset/nzflora-brownsey-perrie-2021-pteridaceae", label: "landcareresearch.co.nz" },
  { name: "Wikimedia Commons", href: "https://commons.wikimedia.org/", label: "commons.wikimedia.org" },
  { name: "NZ Plants, University of Auckland", href: "http://www.nzplants.auckland.ac.nz/", label: "nzplants.auckland.ac.nz" },
  { name: "Regional council boundaries (nz-regions.geojson, local dataset)", href: null, label: null },
];

export default function About() {
  return (
    <Layout>
      <header className="border-b-2 border-ink py-10">
        <span className="label">Colophon</span>
        <h1 className="mt-4 text-[2.5rem] font-extrabold leading-[0.95] tracking-[-0.03em] md:text-[3.75rem]">
          About the archive
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          Pteridophyta is a working index of the native and endemic ferns and
          lycophytes of Aotearoa New Zealand. It draws taxonomy, conservation
          status, distribution, and field notes from the public botanical
          record and presents them as a single, navigable reference.
        </p>
      </header>

      <div className="grid gap-12 py-10 md:grid-cols-[1fr_1.4fr]">
        <section>
          <span className="label">Method</span>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
            Taxonomy is drawn from the 2025 dataset; common names, conservation
            status, and narrative fields are overlaid from curated records where
            available. Fields can be sparse, anything not recorded is shown as
            “–” rather than guessed. Distribution maps are approximate,
            interpreted from text descriptions of regional occurrence.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="bg-ink px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-paper transition-colors hover:bg-fern"
            >
              Browse the index →
            </Link>
            <Link
              to="/identify"
              className="border border-line-2 px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-ink transition-colors hover:border-ink"
            >
              Identify a fern
            </Link>
          </div>
        </section>

        <section>
          <div className="border-b-2 border-ink pb-2">
            <span className="label">Sources · {SOURCES.length}</span>
          </div>
          <ol>
            {SOURCES.map((s, i) => (
              <li
                key={s.name}
                className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-line py-4"
              >
                <span className="font-mono text-[12px] text-ink-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-[14px] leading-snug text-ink">
                    {s.name}
                  </span>
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-ink mt-1 inline-block font-mono text-[12px] text-fern"
                    >
                      {s.label} ↗
                    </a>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Layout>
  );
}
