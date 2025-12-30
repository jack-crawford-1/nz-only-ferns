import Navbar from "../components/nav/Navbar";

const HABITATS = [
  {
    title: "Lowland forest understory",
    description:
      "Sheltered forest floors stay humid year-round, giving ground ferns steady moisture and filtered light. Look for dense fronds forming soft carpets under podocarp and broadleaf canopies.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
    alt: "Sunlight filtering through a dense forest canopy",
    cues: ["High humidity", "Deep leaf litter", "Filtered light"],
  },
  {
    title: "Tree fern gullies",
    description:
      "Cool gullies and ravines hold mist and steady shade. Tree fern trunks create vertical habitat for smaller ferns and mosses, while the ground stays damp even in summer.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    alt: "Mist in a shaded forest gully",
    cues: ["Cool air pockets", "Water seepage", "Layered canopy"],
  },
  {
    title: "Stream and river margins",
    description:
      "Riparian zones provide constant moisture and nutrient-rich soils. Many fern species tolerate occasional flooding and stabilize banks with dense root mats.",
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80",
    alt: "A clear stream running through green vegetation",
    cues: ["Flowing water", "Gravelly soils", "Seasonal flooding"],
  },
  {
    title: "Coastal cliffs and dunes",
    description:
      "Salt spray, wind, and strong light make coastal habitats challenging. Ferns here are often tougher, with thicker fronds that resist drying and salty air.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    alt: "Waves crashing near a rocky coastline",
    cues: ["Salt spray", "Wind exposure", "Sandy or rocky soils"],
  },
  {
    title: "Alpine and subalpine slopes",
    description:
      "High-elevation ferns face frost, snow, and short growing seasons. Many grow in rock crevices or tussock edges where moisture collects and wind is reduced.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    alt: "Snow-dusted mountains under a bright sky",
    cues: ["Cool temperatures", "Short summers", "Sheltered rock pockets"],
  },
  {
    title: "Rock outcrops and epiphytes",
    description:
      "Some ferns cling to mossy boulders or live high on tree trunks. These species rely on rain, mist, and organic debris rather than deep soil.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    alt: "Lush green forest with mossy trunks",
    cues: ["Mossy bark", "Frequent mist", "Minimal soil"],
  },
];

export default function Habitats() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#e9f3ff] via-white to-[#f6f8fb]">
      <Navbar ferns={[]} />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-32">
        <section className="mb-8 flex flex-col gap-6 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1967d2]">
                Habitats
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Where New Zealand ferns thrive
              </h1>
              <p className="max-w-2xl text-sm text-gray-600">
                Ferns respond quickly to moisture, shade, and temperature.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {HABITATS.map((habitat) => (
            <article
              key={habitat.title}
              className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100"
            >
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={habitat.image}
                  alt={habitat.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="space-y-3 p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  {habitat.title}
                </h2>
                <p className="text-sm text-gray-600">{habitat.description}</p>
                <div className="flex flex-wrap gap-2">
                  {habitat.cues.map((cue) => (
                    <span
                      key={cue}
                      className="rounded-full bg-[#f3f6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1e60d4]"
                    >
                      {cue}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
