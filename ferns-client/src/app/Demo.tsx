import DistributionMap from "../components/DistributionMap";

export default function Demo() {
  const fern = {
    scientificName: "Alsophila dealbata",
    commonNames: ["silver fern", "ponga"],
    family: "Cyatheaceae",
    conservationStatus: "Not Threatened",
    biostatus: "Indigenous (Endemic).",
    altitudinalRange: "0–900 m.",
    distribution:
      "North Island: widespread from Te Paki to Wellington.\nSouth Island: common in lowland to montane forests from Nelson to Southland, sparse in the driest eastern districts. Also present on Stewart Island.\nTypically abundant in shaded coastal to lower-montane forests, especially on well-drained slopes and banks.",
    habitat:
      "Shaded coastal to lower-montane forests, especially on well-drained slopes and banks.",
    recognition:
      "Iconic silver fern with a slender trunk, persistent skirt of old stipes, and arching fronds whose undersides are conspicuously glaucous-white from dense scales. Stipe scales are dark with pale edges. Lack of spine-tipped stipe scales and the silvery lower lamina distinguish it from other New Zealand tree ferns.",
    notes:
      "National emblem of New Zealand sports teams. Often still cited under Cyathea dealbata; sometimes confused with A. australis in cultivation, but that species lacks the intense silver underside.",
    isEndemic: true,
    isNative: true,
  };

  const distributionText = fern.distribution ?? "";

  const gallery = [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Cyathea_dealbata_-_Jon_Sullivan_-_1385477.jpeg",
      alt: "Cyathea dealbata (silver fern) fronds",
      name: "Alsophila dealbata",
      common: "Silver fern",
    },
  ];

  const quickFacts = [
    { label: "Family", value: fern.family },
    { label: "Conservation status", value: fern.conservationStatus },
    { label: "Biostatus", value: fern.biostatus },
    { label: "Altitudinal range", value: fern.altitudinalRange },
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

  const speciesProfile = {
    name: fern.scientificName,
    common: fern.commonNames.join(", "),
    group: "Tree fern",
    recognition:
      "Silvery underside, dark stipe scales, and a persistent skirt of old stipes.",
    habitat: fern.habitat,
    range: "Widespread in both main islands, extending to Stewart Island.",
  };

  const deepDiveSections = [
    {
      title: "Focus",
      body: "Silver fern focus. This deep dive isolates Alsophila dealbata so the key identifiers, habitat preferences, and range cues are easy to scan and apply in the field.",
    },
    {
      title: "Microclimate",
      body: "Most abundant in shaded coastal to lower-montane forests. Well-drained slopes and banks are the most reliable habitats for established stands.",
    },
    {
      title: "Field cues",
      body: "The silvery underside of the fronds is the fastest identifier, backed by dark stipe scales and the skirt of old stipes along the trunk.",
    },
    {
      title: "Conservation context",
      body: "Not Threatened. The species remains common, but local populations can still be impacted by browsing or habitat disturbance.",
    },
  ];

  return (
    <div className="demo-feature min-h-screen">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600&display=swap");
        .demo-feature {
          --ink: #1d2420;
          --muted: #5a665f;
          --paper: #f6f5f1;
          --line: #e3e1da;
          --accent: #3b5a49;
          font-family: "Manrope", "Segoe UI", sans-serif;
          background: var(--paper);
          color: var(--ink);
        }
        .demo-feature h1,
        .demo-feature h2,
        .demo-feature h3 {
          font-family: "Cormorant Garamond", "Times New Roman", serif;
          letter-spacing: -0.01em;
        }
        .demo-feature .eyebrow {
          font-size: 11px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .demo-feature .divider {
          border-top: 1px solid var(--line);
        }
        .demo-feature .panel {
          border: 1px solid var(--line);
          background: #ffffff;
        }
        .demo-feature .photo {
          filter: saturate(0.85);
        }
        .demo-feature .fade {
          animation: demoFade 0.7s ease-out both;
        }
        @keyframes demoFade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-20">
        <header className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="fade">
            <p className="eyebrow">Silver Fern</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
              {fern.scientificName}
            </h1>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              {fern.commonNames.join(", ")}
            </p>
            <p className="mt-4 text-base text-[var(--muted)]">
              A focused field study on New Zealand’s silver fern. This page keeps
              the narrative narrow: recognition, habitat, and range signals, plus
              the same quick facts shown on the Fern Details view.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="panel rounded-2xl px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--ink)]">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
            {distributionText ? (
              <div className="mt-4 w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-4">
                <DistributionMap distributionText={distributionText} />
              </div>
            ) : null}
          </div>
          <figure className="fade overflow-hidden rounded-[28px] border border-[var(--line)] bg-white">
            <img
              src={gallery[0].src}
              alt={gallery[0].alt}
              className="photo h-72 w-full object-cover sm:h-96"
              loading="lazy"
            />
            <figcaption className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {gallery[0].name} - {gallery[0].common}
            </figcaption>
          </figure>
        </header>

        <section className="divider pt-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="panel rounded-2xl px-5 py-5">
              <h2 className="text-2xl font-semibold">Profile lens</h2>
              <p className="mt-3 text-sm text-[var(--muted)]">
                One species, full context. Recognition, habitat, distribution,
                and conservation status are pulled together in one view.
              </p>
            </div>
            <div className="panel rounded-2xl px-5 py-5">
              <h2 className="text-2xl font-semibold">Habitat signal</h2>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Most abundant in shaded coastal to lower-montane forest on
                well-drained slopes and banks.
              </p>
            </div>
            <div className="panel rounded-2xl px-5 py-5">
              <h2 className="text-2xl font-semibold">Recognition</h2>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Silvery undersides, dark stipe scales, and a persistent skirt of
                old stipes distinguish the silver fern from other tree ferns.
              </p>
            </div>
          </div>
        </section>

        <section className="divider pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="eyebrow">Species Profile</p>
              <h2 className="mt-3 text-3xl font-semibold">Silver fern profile</h2>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Quick recognition cues and range summary.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="panel rounded-2xl px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold">{speciesProfile.name}</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  {speciesProfile.group}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {speciesProfile.common}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                <p>
                  <span className="font-semibold text-[var(--ink)]">
                    Recognition:
                  </span>{" "}
                  {speciesProfile.recognition}
                </p>
                <p>
                  <span className="font-semibold text-[var(--ink)]">
                    Habitat:
                  </span>{" "}
                  {speciesProfile.habitat}
                </p>
                <p>
                  <span className="font-semibold text-[var(--ink)]">Range:</span>{" "}
                  {speciesProfile.range}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="divider grid gap-6 pt-10 lg:grid-cols-2">
          {deepDiveSections.map((section) => (
            <div key={section.title} className="panel rounded-2xl px-5 py-5">
              <h3 className="text-2xl font-semibold">{section.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {section.body}
              </p>
            </div>
          ))}
        </section>

        <section className="divider pt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold">Fern details</h2>
            <p className="text-sm text-[var(--muted)]">
              Same sections as Fern Details.
            </p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {detailSections.map((section) => (
              <article key={section.title} className="panel rounded-2xl px-5 py-5">
                <h3 className="text-2xl font-semibold">{section.title}</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
                  {section.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="divider pt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold">Reference images</h2>
            <p className="text-sm text-[var(--muted)]">Endemic focus set</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {gallery.map((image) => (
              <figure
                key={image.alt}
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="photo h-44 w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="px-4 py-3 text-xs text-[var(--muted)]">
                  <span className="uppercase tracking-[0.2em]">
                    {image.common}
                  </span>
                  <span className="block text-[11px]">{image.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
