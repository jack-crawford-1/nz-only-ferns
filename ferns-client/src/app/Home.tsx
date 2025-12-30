import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#e9f3ff] via-white to-[#f6f8fb]">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-20">
        <section className="mb-8 flex flex-col gap-6 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1967d2]">
                About the project
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                New Zealand Only Ferns
              </h1>
              <p className="max-w-2xl text-sm text-gray-600">
                A library documenting New Zealand native and endemic fern
                species, with conservation status and distribution notes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e0edff] px-3 py-1 font-semibold text-[#1e60d4]">
              5 sources
            </span>
            <span
              className="hidden h-4 w-px bg-gray-200 sm:inline-block"
              aria-hidden
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/">
              <button className="rounded-full bg-linear-to-r from-[#1e60d4] to-[#0fb59c] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl">
                Explore the fern list
              </button>
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1967d2]">
                Sources
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">
                  New Zealand Plant Conservation Network
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1e60d4]">
                  NZPCN
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                The main flora database used to confirm endemic, indigenous, or
                introduced biostatus and link each taxon to conservation status.
              </p>
              <a
                href="https://www.nzpcn.org.nz/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm font-semibold text-[#1e60d4] hover:text-[#0f4fa4]"
              >
                nzpcn.org.nz
              </a>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">
                  NZFlora / Landcare Research
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1e60d4]">
                  NZFlora
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Verified endemism, synonymy, and island distribution for genera
                such as <em>Notogrammitis</em>, <em>Tmesipteris</em>, and{" "}
                <em>Loxsoma</em>.
              </p>
              <a
                href="https://nzflora.landcareresearch.co.nz/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm font-semibold text-[#1e60d4] hover:text-[#0f4fa4]"
              >
                nzflora.landcareresearch.co.nz
              </a>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Global Biodiversity Information Facility
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1e60d4]">
                  GBIF
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Used to confirm that each NZ-only record had no verified
                occurrences overseas.
              </p>
              <a
                href="https://www.gbif.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm font-semibold text-[#1e60d4] hover:text-[#0f4fa4]"
              >
                gbif.org
              </a>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Department of Conservation
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1e60d4]">
                  DOC
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Cross-referenced conservation categories such as{" "}
                <em>Threatened - Nationally Endangered</em> or{" "}
                <em>At Risk - Relict</em>.
              </p>
              <a
                href="https://www.doc.govt.nz/nature/biodiversity/nz-threat-classification-system/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm font-semibold text-[#1e60d4] hover:text-[#0f4fa4]"
              >
                doc.govt.nz/nature/biodiversity/nz-threat-classification-system/
              </a>
            </article>

            <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100 md:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Supporting literature
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1e60d4]">
                  Guides
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Brownsey, P. J. &amp; Perrie, L. R. (2015).{" "}
                <em>New Zealand Ferns and Lycophytes: A Guide to Species.</em>{" "}
                Te Papa Press. Includes data from Allan Herbarium (CHR) and
                NZFlora archives.
              </p>
              <p className="mt-3 text-sm font-semibold text-gray-800">
                A fern was treated as endemic if:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                <li>NZPCN biostatus = Endemic.</li>
                <li>
                  NZFlora distribution = North, South, Stewart, and Chatham
                  Islands only.
                </li>
                <li>
                  GBIF plus literature showed no verified records outside New
                  Zealand.
                </li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
