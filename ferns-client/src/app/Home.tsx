import { Link } from "react-router";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#22342606] ">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-20 ">
        <section className="mb-8 flex flex-col gap-6 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#20624a]">
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

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 ">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e2f0e8] px-3 py-1 font-semibold text-[#1f4d3a]">
              8 sources
            </span>
            <span
              className="hidden h-4 w-px bg-gray-200 sm:inline-block"
              aria-hidden
            />
          </div>

          <div className="flex flex-wrap gap-3 ">
            <Link to="/ferns">
              <button className="rounded-full bg-[#1f4d3a] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#143324] hover:shadow-xl">
                Explore the fern list
              </button>
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#20624a]">
                Sources
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100">
            <ol className="list-decimal space-y-3 pl-5 text-sm text-gray-700">
              <li>
                <span className="font-semibold text-gray-900">
                  New Zealand Plant Conservation Network (NZPCN).
                </span>{" "}
                <a
                  href="https://www.nzpcn.org.nz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1f4d3a] hover:text-[#143324]"
                >
                  nzpcn.org.nz
                </a>
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  NZFlora / Landcare Research.
                </span>{" "}
                <a
                  href="https://nzflora.landcareresearch.co.nz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1f4d3a] hover:text-[#143324]"
                >
                  nzflora.landcareresearch.co.nz
                </a>
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  Global Biodiversity Information Facility (GBIF).
                </span>{" "}
                <a
                  href="https://www.gbif.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1f4d3a] hover:text-[#143324]"
                >
                  gbif.org
                </a>
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  Department of Conservation (DOC).
                </span>{" "}
                <a
                  href="https://www.doc.govt.nz/nature/biodiversity/nz-threat-classification-system/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1f4d3a] hover:text-[#143324]"
                >
                  doc.govt.nz/nature/biodiversity/nz-threat-classification-system/
                </a>
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  Brownsey, P. J. &amp; Perrie, L. R. (2015).{" "}
                  <em>New Zealand Ferns and Lycophytes: A Guide to Species.</em>{" "}
                  Te Papa Press.
                </span>{" "}
                <a
                  href="https://datastore.landcareresearch.co.nz/dataset/nzflora-brownsey-perrie-2021-pteridaceae/resource/97215842-8ecc-4067-a7a6-fc18250f6fc9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1f4d3a] hover:text-[#143324]"
                >
                  landcareresearch.co.nz/dataset/nzflora-brownsey-perrie-2021-pteridaceae
                </a>
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  Wikimedia Commons.
                </span>{" "}
                <a
                  href="https://commons.wikimedia.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1f4d3a] hover:text-[#143324]"
                >
                  commons.wikimedia.org
                </a>
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  NZ Plants (University of Auckland).
                </span>{" "}
                <a
                  href="http://www.nzplants.auckland.ac.nz/en/about/ferns/native-ferns/pteridaceae-maidenhair-annual-rock-brake-ferns/adiantum-diaphanum.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#1f4d3a] hover:text-[#143324]"
                >
                  nzplants.auckland.ac.nz
                </a>
              </li>
              <li>
                <span className="font-semibold text-gray-900">
                  Regional council boundaries (nz-regions.geojson, local file).
                </span>
              </li>
            </ol>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
