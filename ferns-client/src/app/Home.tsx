import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen w-screen bg-gray-700 m-0 flex flex-col justify-center items-center pt-20 pb-40">
      <div className="max-w-3xl text-gray-300 space-y-4">
        <h2 className="text-2xl font-bold">New Zealand Only Ferns</h2>

        <p>
          This is an early attempt at creating a clear, open resource for
          documenting New Zealand’s endemic fern species.I’d heard we had
          hundreds of native ferns, but finding a definitive list of species
          unique to NZ wasn't straightforward. The data looks to exists, but
          it’s scattered across scientific databases, papers, and older field
          guides.
        </p>

        <p>
          I started with the{" "}
          <a
            href="https://www.nzpcn.org.nz/flora/species/?structural_class=3861&native=1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            New Zealand Plant Conservation Network (NZPCN) dataset
          </a>{" "}
          of 201 native ferns and lycophytes.
        </p>

        <p>
          From there, I used GPT to cross reference multiple sources to isolate{" "}
          endemic only species:
        </p>

        <div className="space-y-3 pl-4">
          <ol className="list-decimal space-y-2">
            <li>
              <strong>New Zealand Plant Conservation Network (NZPCN)</strong> —{" "}
              <a
                href="https://www.nzpcn.org.nz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                nzpcn.org.nz
              </a>
              <br />
              The main flora database used to confirm “Endemic,” “Indigenous,”
              or “Introduced” biostatus and link each taxon to its conservation
              status.
            </li>

            <li>
              <strong>NZFlora / Landcare Research – Manaaki Whenua</strong> —{" "}
              <a
                href="https://nzflora.landcareresearch.co.nz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                nzflora.landcareresearch.co.nz
              </a>
              <br />
              Verified endemism, synonymy, and island distribution for genera
              such as <em>Notogrammitis</em>, <em>Tmesipteris</em>, and{" "}
              <em>Loxsoma</em>.
            </li>

            <li>
              <strong>Global Biodiversity Information Facility (GBIF)</strong> —{" "}
              <a
                href="https://www.gbif.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                gbif.org
              </a>
              <br />
              Used to confirm that each “NZ only” record had no verified
              occurrences overseas.
            </li>

            <li>
              <strong>Department of Conservation (DOC)</strong> —{" "}
              <a
                href="https://www.doc.govt.nz/nature/biodiversity/nz-threat-classification-system/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                doc.govt.nz/nature/biodiversity/nz-threat-classification-system/
              </a>
              <br />
              Cross-referenced conservation categories such as{" "}
              <em>Threatened – Nationally Endangered</em> or{" "}
              <em>At Risk – Relict</em>.
            </li>

            <li>
              <strong>Supporting Literature</strong> — Brownsey, P. J. & Perrie,
              L. R. (2015).{" "}
              <em>New Zealand Ferns and Lycophytes: A Guide to Species.</em> Te
              Papa Press. Includes data from Allan Herbarium (CHR) and NZFlora
              archives.
              <br />A fern was treated as <strong>endemic</strong> if:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>NZPCN Biostatus = Endemic</li>
                <li>
                  NZFlora distribution = “North, South, Stewart, and Chatham
                  Islands only”
                </li>
                <li>
                  GBIF + literature showed no verified records outside New
                  Zealand
                </li>
              </ul>
            </li>
          </ol>
        </div>

        <p>
          The current dataset lists each fern’s scientific name , family, common
          names, endemic status, and conservation status. Some entries seem
          accurate, others need review but it’s intended as a living reference
          that will grow with more data, photos, and mapping over time.
        </p>

        <Link to="/ferns">
          <button className="mt-20 px-4 py-2 text-blue-400 hover:text-blue-500 underline">
            Go to Ferns Page
          </button>
        </Link>
      </div>
    </div>
  );
}
