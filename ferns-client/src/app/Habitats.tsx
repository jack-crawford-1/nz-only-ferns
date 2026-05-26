import { Link } from "react-router";
import Layout from "../components/Layout";

const HABITATS = [
  {
    title: "Lowland forest understory",
    description:
      "Sheltered forest floors stay humid year-round, giving ground ferns steady moisture and filtered light. Look for dense fronds forming soft carpets under podocarp and broadleaf canopies.",
    image: "/habitats/understory.png",
    alt: "Sunlight filtering through a dense forest canopy",
    cues: ["High humidity", "Deep leaf litter", "Filtered light"],
    examples: ["Asplenium bulbiferum", "Blechnum novae-zelandiae"],
  },
  {
    title: "Tree fern gullies",
    description:
      "Cool gullies and ravines hold mist and steady shade. Tree fern trunks create vertical habitat for smaller ferns and mosses, while the ground stays damp even in summer.",
    image: "/habitats/gully.jpg",
    alt: "Mist in a shaded forest gully",
    cues: ["Cool air pockets", "Water seepage", "Layered canopy"],
    examples: ["Cyathea dealbata", "Dicksonia squarrosa"],
  },
  {
    title: "Stream and river margins",
    description:
      "Riparian zones provide constant moisture and nutrient-rich soils. Many fern species tolerate occasional flooding and stabilise banks with dense root mats.",
    image: "/habitats/margins.png",
    alt: "A clear stream running through green vegetation",
    cues: ["Flowing water", "Gravelly soils", "Seasonal flooding"],
    examples: ["Adiantum aethiopicum", "Histiopteris incisa"],
  },
  {
    title: "Coastal cliffs and dunes",
    description:
      "Salt spray, wind, and strong light make coastal habitats challenging. Ferns here are often tougher, with thicker fronds that resist drying and salty air.",
    image: "/habitats/dunes.png",
    alt: "Waves crashing near a rocky coastline",
    cues: ["Salt spray", "Wind exposure", "Sandy or rocky soils"],
    examples: ["Pteris tremula", "Asplenium obtusatum"],
  },
  {
    title: "Alpine and subalpine slopes",
    description:
      "High-elevation ferns face frost, snow, and short growing seasons. Many grow in rock crevices or tussock edges where moisture collects and wind is reduced.",
    image: "/habitats/slopes.png",
    alt: "Snow-dusted mountains under a bright sky",
    cues: ["Cool temperatures", "Short summers", "Sheltered rock pockets"],
    examples: ["Blechnum penna-marina", "Polystichum vestitum"],
  },
  {
    title: "Rock outcrops and epiphytes",
    description:
      "Some ferns cling to mossy boulders or live high on tree trunks. These species rely on rain, mist, and organic debris rather than deep soil.",
    image: "/habitats/epiphytes.png",
    alt: "Lush green forest with mossy trunks",
    cues: ["Mossy bark", "Frequent mist", "Minimal soil"],
    examples: ["Asplenium flaccidum", "Hymenophyllum demissum"],
  },
];

export default function Habitats() {
  return (
    <Layout>
      <header className="border-b-2 border-ink py-10">
        <span className="label">Field notes · {HABITATS.length} habitats</span>
        <h1 className="mt-4 text-[2.5rem] font-extrabold leading-[0.95] tracking-[-0.03em] md:text-[3.75rem]">
          Where ferns thrive
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-2">
          From dripping gully floors to wind-scoured coast, Aotearoa's ferns
          occupy a wide spread of niches. These are the recurring settings,
          and the cues that mark each one.
        </p>
      </header>

      {HABITATS.map((habitat, i) => (
        <article
          key={habitat.title}
          className="grid items-center gap-6 border-b border-line py-10 md:grid-cols-2 md:gap-12"
        >
          <div
            className={`relative aspect-4/3 overflow-hidden border border-line bg-paper-2 ${
              i % 2 === 1 ? "md:order-2" : ""
            }`}
          >
            <img
              src={habitat.image}
              alt={habitat.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <span className="absolute left-0 top-0 bg-paper px-2 py-1 font-mono text-[12px] text-ink">
              № {String(i + 1).padStart(2, "0")}
            </span>
          </div>

          <div>
            <h2 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em] md:text-[2.25rem]">
              {habitat.title}
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-2">
              {habitat.description}
            </p>

            <div className="mt-5">
              <span className="label">Field cues</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {habitat.cues.map((cue) => (
                  <span
                    key={cue}
                    className="border border-line-2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-ink-2"
                  >
                    {cue}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="label">Typical species</span>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                {habitat.examples.map((example) => (
                  <Link
                    key={example}
                    to={`/ferns/${encodeURIComponent(example)}`}
                    className="link-ink text-[15px] italic text-ink hover:text-fern"
                  >
                    {example}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </Layout>
  );
}
