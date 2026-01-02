import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Navbar from "../components/nav/Navbar";
import Footer from "../components/Footer";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";

type FernTraits = {
  isTreeFern: boolean;
  isFilmy: boolean;
  isEpiphyte: boolean;
  isClimbing: boolean;
  isCoastal: boolean;
  isAlpine: boolean;
  isLimestone: boolean;
  isWetland: boolean;
  northIsland: boolean;
  southIsland: boolean;
  isEndemic: boolean;
  isNative: boolean;
};

type FernEntry = {
  fern: FernRecord;
  traits: FernTraits;
};

type KeyQuestion = {
  id: string;
  prompt: string;
  description?: string;
  yesLabel: string;
  noLabel: string;
  priority: number;
  predicate: (entry: FernEntry) => boolean;
};

type KeyAnswer = {
  questionId: string;
  choice: boolean;
  label: string;
};

const NORTH_ISLAND_HINTS = [
  "north island",
  "northland",
  "auckland",
  "waikato",
  "bay of plenty",
  "gisborne",
  "taranaki",
  "hawkes bay",
  "manawatu",
  "whanganui",
  "wanganui",
  "wellington",
  "volcanic plateau",
  "coromandel",
  "east cape",
  "wairarapa",
];

const SOUTH_ISLAND_HINTS = [
  "south island",
  "tasman",
  "nelson",
  "marlborough",
  "west coast",
  "westland",
  "canterbury",
  "otago",
  "southland",
  "fiordland",
  "stewart island",
  "marlborough sounds",
  "sounds nelson",
];

const NATIONWIDE_HINTS = [
  "throughout new zealand",
  "throughout nz",
  "across new zealand",
  "across nz",
  "widespread throughout new zealand",
  "widespread across new zealand",
  "throughout the country",
  "across the country",
  "both islands",
  "both main islands",
  "north and south island",
  "north and south islands",
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildTraits = (fern: FernRecord): FernTraits => {
  const combinedText = [
    fern.distribution,
    fern.habitat,
    fern.recognition,
    fern.notes,
    fern.commonNames.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
  const text = normalizeText(combinedText);
  const family = normalizeText(fern.family || "");
  const distribution = normalizeText(fern.distribution || "");

  const hasAny = (keywords: string[]) =>
    keywords.some((keyword) => text.includes(keyword));
  const distributionHasAny = (keywords: string[]) =>
    keywords.some((keyword) => distribution.includes(keyword));
  const isNationwide = NATIONWIDE_HINTS.some((hint) =>
    distribution.includes(hint)
  );

  const northIsland =
    isNationwide || distributionHasAny(NORTH_ISLAND_HINTS);
  const southIsland =
    isNationwide || distributionHasAny(SOUTH_ISLAND_HINTS);

  return {
    isTreeFern:
      family.includes("cyatheaceae") ||
      family.includes("dicksoniaceae") ||
      text.includes("tree fern"),
    isFilmy:
      family.includes("hymenophyllaceae") ||
      text.includes("filmy") ||
      text.includes("filmy fern"),
    isEpiphyte: hasAny(["epiphyte", "epiphytic"]),
    isClimbing: hasAny(["climbing", "scrambling", "clambering"]),
    isCoastal: hasAny(["coastal", "shore", "sea cliff", "dune"]),
    isAlpine: hasAny(["alpine", "subalpine", "montane"]),
    isLimestone: hasAny(["limestone", "karst", "cave", "sinkhole"]),
    isWetland: hasAny(["swamp", "bog", "wetland", "marsh"]),
    northIsland,
    southIsland,
    isEndemic: fern.isEndemic,
    isNative: fern.isNative,
  };
};

const QUESTIONS: KeyQuestion[] = [
  {
    id: "tree-fern",
    prompt: "Does it form a trunk (tree fern)?",
    description: "Look for a distinct trunk with a crown of fronds.",
    yesLabel: "Yes, a trunked tree fern",
    noLabel: "No, ground or creeping fern",
    priority: 0,
    predicate: (entry) => entry.traits.isTreeFern,
  },
  {
    id: "filmy-fern",
    prompt: "Are the fronds paper-thin and translucent?",
    description: "Filmy ferns have delicate, see-through fronds.",
    yesLabel: "Yes, filmy fronds",
    noLabel: "No, thicker fronds",
    priority: 0,
    predicate: (entry) => entry.traits.isFilmy,
  },
  {
    id: "epiphyte",
    prompt: "Does it grow on trees or other plants?",
    description: "Epiphytes often sit on trunks or branches.",
    yesLabel: "Yes, often epiphytic",
    noLabel: "Mostly terrestrial",
    priority: 0,
    predicate: (entry) => entry.traits.isEpiphyte,
  },
  {
    id: "climbing",
    prompt: "Does it climb or scramble over other plants?",
    description: "Look for scrambling or twining fronds.",
    yesLabel: "Yes, climbing or scrambling",
    noLabel: "No, not climbing",
    priority: 0,
    predicate: (entry) => entry.traits.isClimbing,
  },
  {
    id: "coastal",
    prompt: "Is it mainly found in coastal habitats?",
    description: "Shoreline, dunes, sea cliffs, or coastal forest.",
    yesLabel: "Yes, coastal",
    noLabel: "No, inland",
    priority: 0,
    predicate: (entry) => entry.traits.isCoastal,
  },
  {
    id: "alpine",
    prompt: "Is it mostly alpine or subalpine?",
    description: "High-elevation or montane sites.",
    yesLabel: "Yes, alpine or subalpine",
    noLabel: "No, mostly lowland",
    priority: 0,
    predicate: (entry) => entry.traits.isAlpine,
  },
  {
    id: "limestone",
    prompt: "Is it tied to limestone or karst habitats?",
    description: "Look for references to limestone, caves, or karst.",
    yesLabel: "Yes, limestone or karst",
    noLabel: "No, other substrates",
    priority: 0,
    predicate: (entry) => entry.traits.isLimestone,
  },
  {
    id: "wetland",
    prompt: "Is it associated with wetlands or bogs?",
    description: "Swamps, bogs, marshes, or wet ground.",
    yesLabel: "Yes, wetland fern",
    noLabel: "No, drier habitats",
    priority: 0,
    predicate: (entry) => entry.traits.isWetland,
  },
  {
    id: "north-island",
    prompt: "Is it recorded from the North Island?",
    description: "Based on the distribution notes.",
    yesLabel: "Yes, North Island present",
    noLabel: "No, North Island absent",
    priority: 1,
    predicate: (entry) => entry.traits.northIsland,
  },
  {
    id: "south-island",
    prompt: "Is it recorded from the South Island?",
    description: "Based on the distribution notes.",
    yesLabel: "Yes, South Island present",
    noLabel: "No, South Island absent",
    priority: 1,
    predicate: (entry) => entry.traits.southIsland,
  },
  {
    id: "endemic",
    prompt: "Is it endemic to Aotearoa?",
    description: "Found only in New Zealand.",
    yesLabel: "Yes, endemic",
    noLabel: "No, not endemic",
    priority: 2,
    predicate: (entry) => entry.traits.isEndemic,
  },
  {
    id: "native",
    prompt: "Is it native to Aotearoa?",
    description: "Native species vs introduced.",
    yesLabel: "Yes, native",
    noLabel: "No, not native",
    priority: 2,
    predicate: (entry) => entry.traits.isNative,
  },
];

const QUESTIONS_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));

const pickBestQuestion = (
  entries: FernEntry[],
  answeredIds: Set<string>
) => {
  const candidates = QUESTIONS.flatMap((question) => {
    if (answeredIds.has(question.id)) return [];
    let yesCount = 0;
    let noCount = 0;

    for (const entry of entries) {
      if (question.predicate(entry)) yesCount += 1;
      else noCount += 1;
    }

    if (yesCount === 0 || noCount === 0) return [];
    return [
      {
        question,
        yesCount,
        noCount,
        balance: Math.abs(yesCount - noCount),
      },
    ];
  });

  if (candidates.length === 0) return null;

  const minPriority = Math.min(
    ...candidates.map((candidate) => candidate.question.priority)
  );

  const priorityCandidates = candidates.filter(
    (candidate) => candidate.question.priority === minPriority
  );

  priorityCandidates.sort((a, b) => a.balance - b.balance);
  return priorityCandidates[0]?.question ?? null;
};

const renderMatchImage = (fern: FernRecord) =>
  fern.imageUrl ? (
    <img
      src={fern.imageUrl}
      alt={fern.scientificName}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-[#f3f7f4] text-[10px] text-gray-500">
      No image
    </div>
  );

export default function Key() {
  const [ferns, setFerns] = useState<FernRecord[]>([]);
  const [answers, setAnswers] = useState<KeyAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFerns()
      .then((data) => setFerns(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const fernEntries = useMemo(
    () =>
      ferns.map((fern) => ({
        fern,
        traits: buildTraits(fern),
      })),
    [ferns]
  );

  const answeredIds = useMemo(
    () => new Set(answers.map((answer) => answer.questionId)),
    [answers]
  );

  const filteredEntries = useMemo(() => {
    return fernEntries.filter((entry) =>
      answers.every((answer) => {
        const question = QUESTIONS_BY_ID.get(answer.questionId);
        if (!question) return true;
        const matches = question.predicate(entry);
        return answer.choice ? matches : !matches;
      })
    );
  }, [fernEntries, answers]);

  const currentQuestion = useMemo(() => {
    if (filteredEntries.length <= 1) return null;
    return pickBestQuestion(filteredEntries, answeredIds);
  }, [filteredEntries, answeredIds]);

  const handleChoice = (choice: boolean) => {
    if (!currentQuestion) return;
    const label = choice ? currentQuestion.yesLabel : currentQuestion.noLabel;
    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, choice, label },
    ]);
  };

  const handleBack = () => {
    setAnswers((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setAnswers([]);
  };

  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;
  if (isLoading)
    return (
      <div className="min-h-screen bg-[#22342606]">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-32">
          <div className="rounded-2xl bg-white/80 p-6 text-sm text-gray-600 shadow-lg ring-1 ring-gray-100 backdrop-blur">
            Loading key...
          </div>
        </main>
      </div>
    );

  const matchCount = filteredEntries.length;
  const matches = filteredEntries.slice(0, 6);
  const stepNumber = answers.length + 1;

  return (
    <div className="min-h-screen bg-[#22342606]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-32">
        <section className="mb-6 rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#20624a]">
                Dichotomous key
              </p>
              <h1
                className="text-3xl font-bold text-gray-900"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Identify a fern from the library
              </h1>
              <p className="max-w-2xl text-sm text-gray-600">
                Work through the steps and the key will narrow the list using
                the notes in the database. Choose the closest match if you are
                unsure.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f3f7f4] px-4 py-3 text-xs text-gray-600">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                Matches
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#1f4d3a]">
                {matchCount}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                <span className="font-semibold uppercase tracking-[0.16em] text-[#1f4d3a]">
                  Step {stepNumber}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#1f4d3a] shadow-sm">
                  {matchCount} matches
                </span>
              </div>

              {matchCount === 0 ? (
                <div className="mt-6 space-y-3">
                  <p className="text-lg font-semibold text-gray-900">
                    No matches left
                  </p>
                  <p className="text-sm text-gray-600">
                    Step back to the previous choice, or reset the key to try
                    again.
                  </p>
                </div>
              ) : currentQuestion ? (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-900">
                      {currentQuestion.prompt}
                    </p>
                    {currentQuestion.description ? (
                      <p className="text-sm text-gray-600">
                        {currentQuestion.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleChoice(true)}
                      className="rounded-2xl border border-transparent bg-[#1f4d3a] px-4 py-4 text-left text-sm font-semibold text-white shadow-lg transition hover:bg-[#143324]"
                    >
                      {currentQuestion.yesLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChoice(false)}
                      className="rounded-2xl border border-[#c7d9cf] bg-white px-4 py-4 text-left text-sm font-semibold text-[#1f4d3a] shadow-sm transition hover:border-[#1f4d3a]"
                    >
                      {currentQuestion.noLabel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <p className="text-lg font-semibold text-gray-900">
                    {matchCount === 1 ? "Match found" : "Key complete"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {matchCount === 1
                      ? "The key has narrowed down to a single fern."
                      : "No further splits are available for these matches."}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={answers.length === 0}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                    answers.length === 0
                      ? "cursor-not-allowed border-gray-200 bg-white text-gray-400"
                      : "border-[#c7d9cf] bg-white text-[#1f4d3a] hover:border-[#1f4d3a]"
                  }`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full bg-[#e2f0e8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1f4d3a] transition hover:bg-[#d3e7dc]"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold uppercase tracking-[0.16em] text-[#1f4d3a]">
                  Matches
                </span>
                {matchCount > matches.length ? (
                  <span className="text-[11px] text-gray-500">
                    Showing {matches.length} of {matchCount}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {matches.map((entry) => (
                  <Link
                    key={entry.fern.scientificName}
                    to={`/ferns/${encodeURIComponent(
                      entry.fern.scientificName
                    )}`}
                    className="group flex items-center gap-3 rounded-xl bg-[#f3f7f4] p-3 transition hover:bg-white"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#e2e8e0]">
                      {renderMatchImage(entry.fern)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1f4d3a]">
                        {entry.fern.scientificName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {entry.fern.family}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-gray-100 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1f4d3a]">
              Key path
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Each step records a choice in the key. You can backtrack or reset
              at any time.
            </p>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              {answers.length === 0 ? (
                <p className="rounded-xl bg-[#f3f7f4] px-4 py-3 text-xs text-gray-500">
                  No choices yet. Start with the first question.
                </p>
              ) : (
                answers.map((answer, index) => {
                  const question = QUESTIONS_BY_ID.get(answer.questionId);
                  return (
                    <div
                      key={`${answer.questionId}-${index}`}
                      className="rounded-xl bg-[#f3f7f4] px-4 py-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-gray-700">
                        {question?.prompt}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">{answer.label}</p>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </section>

        <Footer />
      </main>
    </div>
  );
}
