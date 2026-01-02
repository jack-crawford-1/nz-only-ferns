import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Navbar from "../components/nav/Navbar";
import Footer from "../components/Footer";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";

type FernTraits = {
  isTreeFern: boolean;
  isFilmy: boolean;
  isMaidenhair: boolean;
  isHighlyDivided: boolean;
  isSimpleFrond: boolean;
  isScalyOrHairy: boolean;
  isLeathery: boolean;
  isEpiphyte: boolean;
  isClimbing: boolean;
  isDimorphic: boolean;
  isCreeping: boolean;
  isMarginalSori: boolean;
  isLinearSori: boolean;
};

type FernEntry = {
  fern: FernRecord;
  traits: FernTraits;
};

type KeyQuestion = {
  id: string;
  prompt: string;
  description?: string;
  definition?: string;
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

const QUESTION_IMAGES: Record<string, { src: string; alt: string }> = {
  "tree-fern": {
    src: "/key/tree-fern.jpg",
    alt: "Tree fern with trunk and crown of fronds",
  },
  "filmy-fern": {
    src: "/key/filmy-fern.jpg",
    alt: "Filmy fern with translucent fronds",
  },
  maidenhair: {
    src: "/key/maidenhair.jpg",
    alt: "Maidenhair fern with fan-shaped leaflets",
  },
  "highly-divided": {
    src: "/key/highly-divided.jpg",
    alt: "Fern with finely divided fronds",
  },
  "simple-frond": {
    src: "/key/simple-frond.jpg",
    alt: "Fern with simple, strap-like fronds",
  },
  leathery: {
    src: "/key/leathery.jpg",
    alt: "Fern with thick, leathery fronds",
  },
  epiphyte: {
    src: "/key/epiphyte.jpg",
    alt: "Epiphytic fern growing on a trunk",
  },
  climbing: {
    src: "/key/climbing.jpg",
    alt: "Climbing fern",
  },
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildTraits = (fern: FernRecord): FernTraits => {
  const combinedText = [
    fern.scientificName,
    fern.family,
    fern.habitat,
    fern.recognition,
    fern.notes,
    fern.commonNames.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
  const text = normalizeText(combinedText);
  const family = normalizeText(fern.family || "");

  const hasAny = (keywords: string[]) =>
    keywords.some((keyword) => text.includes(keyword));
  const hasPattern = (pattern: RegExp) => pattern.test(text);

  const isHighlyDivided =
    hasAny([
      "bipinnate",
      "tripinnate",
      "quadripinnate",
      "multipinnate",
      "finely divided",
      "highly divided",
    ]) || hasPattern(/\b[234]\s*pinnate\b/);

  const isSimpleFrond = hasAny([
    "simple frond",
    "simple fronds",
    "undivided",
    "entire frond",
    "strap",
    "straplike",
    "strap like",
    "ribbon",
    "ribbonlike",
    "ribbon like",
    "tongue",
    "linear frond",
  ]);

  const isMaidenhair =
    hasAny(["maidenhair", "fan shaped", "fanlike", "fan like"]) ||
    text.includes("adiantum");

  return {
    isTreeFern:
      family.includes("cyatheaceae") ||
      family.includes("dicksoniaceae") ||
      text.includes("tree fern"),
    isFilmy:
      family.includes("hymenophyllaceae") ||
      text.includes("filmy") ||
      text.includes("filmy fern"),
    isMaidenhair,
    isHighlyDivided,
    isSimpleFrond,
    isScalyOrHairy: hasAny([
      "scaly",
      "scales",
      "scale",
      "hairy",
      "hairs",
      "hair",
      "bristly",
      "bristles",
      "pubescent",
    ]),
    isLeathery: hasAny([
      "leathery",
      "coriaceous",
      "thick",
      "fleshy",
      "glossy",
      "stiff",
    ]),
    isEpiphyte: hasAny(["epiphyte", "epiphytic"]),
    isClimbing: hasAny(["climbing", "scrambling", "clambering"]),
    isDimorphic: hasAny([
      "dimorphic",
      "fertile fronds",
      "sterile fronds",
      "fertile frond",
      "sterile frond",
    ]),
    isCreeping: hasAny([
      "creeping rhizome",
      "long creeping",
      "long-creeping",
      "creeping rhizomes",
      "creeping",
      "prostrate",
      "mat forming",
      "mat-forming",
    ]),
    isMarginalSori: hasAny([
      "marginal sori",
      "sori along the margins",
      "sori along margins",
      "sori around the margins",
      "sori around margins",
      "sori on the margin",
      "continuous around the margins",
      "false indusium",
      "false indusia",
    ]),
    isLinearSori: hasAny([
      "linear sori",
      "sori linear",
      "elongate sori",
      "sori in lines",
      "continuous sori",
      "sori along the midrib",
      "sori along midrib",
    ]),
  };
};


const QUESTIONS: KeyQuestion[] = [
  {
    id: "tree-fern",
    prompt: "Does it form a trunk (tree fern)?",
    description: "Look for a distinct trunk with a crown of fronds.",
    definition:
      "Tree ferns have a vertical trunk with fronds forming a crown at the top.",
    yesLabel: "Yes, a trunked tree fern",
    noLabel: "No, ground or creeping fern",
    priority: 0,
    predicate: (entry) => entry.traits.isTreeFern,
  },
  {
    id: "filmy-fern",
    prompt: "Are the fronds paper-thin and translucent?",
    description: "Filmy ferns have delicate, see-through fronds.",
    definition:
      "Filmy fronds are one cell thick and look almost transparent.",
    yesLabel: "Yes, filmy fronds",
    noLabel: "No, thicker fronds",
    priority: 0,
    predicate: (entry) => entry.traits.isFilmy,
  },
  {
    id: "maidenhair",
    prompt: "Do the fronds have fan-shaped leaflets (maidenhair)?",
    description: "Maidenhair ferns have delicate, fan-like leaflets.",
    definition: "Look for fan-shaped leaflets on thin, dark stalks.",
    yesLabel: "Yes, fan-shaped leaflets",
    noLabel: "No, other frond shape",
    priority: 0,
    predicate: (entry) => entry.traits.isMaidenhair,
  },
  {
    id: "highly-divided",
    prompt: "Are the fronds very finely divided?",
    description: "Look for bipinnate or tripinnate fronds.",
    definition:
      "Bipinnate or tripinnate fronds split into many small leaflets, giving a lacy look.",
    yesLabel: "Yes, finely divided fronds",
    noLabel: "No, less divided",
    priority: 0,
    predicate: (entry) => entry.traits.isHighlyDivided,
  },
  {
    id: "simple-frond",
    prompt: "Are the fronds simple or strap-like?",
    description: "Undivided or ribbon-like fronds.",
    definition: "Simple fronds are undivided, often strap-like or tongue-shaped.",
    yesLabel: "Yes, simple fronds",
    noLabel: "No, divided fronds",
    priority: 0,
    predicate: (entry) => entry.traits.isSimpleFrond,
  },
  {
    id: "scaly",
    prompt: "Are the fronds or stipes noticeably scaly or hairy?",
    description: "Look for obvious scales or bristles.",
    definition:
      "Scales or hairs are visible on the stipe or rachis, often brown or reddish.",
    yesLabel: "Yes, scaly or hairy",
    noLabel: "No, mostly smooth",
    priority: 1,
    predicate: (entry) => entry.traits.isScalyOrHairy,
  },
  {
    id: "leathery",
    prompt: "Are the fronds thick or leathery?",
    description: "Firm, stiff, or glossy fronds.",
    definition:
      "Leathery fronds feel thick, stiff, or glossy compared to thin fronds.",
    yesLabel: "Yes, thick/leathery",
    noLabel: "No, thin or delicate",
    priority: 1,
    predicate: (entry) => entry.traits.isLeathery,
  },
  {
    id: "epiphyte",
    prompt: "Does it grow on trees or other plants?",
    description: "Epiphytes often sit on trunks or branches.",
    definition:
      "Epiphytes sit on trunks or branches rather than rooting in soil.",
    yesLabel: "Yes, often epiphytic",
    noLabel: "Mostly terrestrial",
    priority: 2,
    predicate: (entry) => entry.traits.isEpiphyte,
  },
  {
    id: "climbing",
    prompt: "Does it climb or scramble over other plants?",
    description: "Look for scrambling or twining fronds.",
    definition:
      "Climbers have long, twining fronds or stems that scramble over other plants.",
    yesLabel: "Yes, climbing or scrambling",
    noLabel: "No, not climbing",
    priority: 2,
    predicate: (entry) => entry.traits.isClimbing,
  },
  {
    id: "dimorphic",
    prompt: "Are fertile and sterile fronds noticeably different?",
    description: "Look for narrow fertile fronds and broader sterile fronds.",
    definition: "Dimorphic ferns have distinct fertile and sterile fronds.",
    yesLabel: "Yes, fronds are dimorphic",
    noLabel: "No, fronds look similar",
    priority: 2,
    predicate: (entry) => entry.traits.isDimorphic,
  },
  {
    id: "creeping",
    prompt: "Does it spread by a creeping rhizome or mat?",
    description: "Creeping rhizomes often form mats across surfaces.",
    definition:
      "Creeping rhizomes spread along the surface and can form mats.",
    yesLabel: "Yes, creeping or mat-forming",
    noLabel: "No, tufted or upright",
    priority: 2,
    predicate: (entry) => entry.traits.isCreeping,
  },
  {
    id: "linear-sori",
    prompt: "Are the sori arranged in long lines?",
    description: "Look for elongated sori rather than round dots.",
    definition: "Linear sori appear as lines instead of round dots.",
    yesLabel: "Yes, linear sori",
    noLabel: "No, round or scattered sori",
    priority: 2,
    predicate: (entry) => entry.traits.isLinearSori,
  },
  {
    id: "marginal-sori",
    prompt: "Are the sori right on the frond margins?",
    description: "Marginal sori often sit on the very edge of the frond.",
    definition:
      "Marginal sori sit on the leaf edge, sometimes under a rolled margin.",
    yesLabel: "Yes, marginal sori",
    noLabel: "No, sori away from edges",
    priority: 2,
    predicate: (entry) => entry.traits.isMarginalSori,
  },
];

const QUESTIONS_BY_ID = new Map(
  QUESTIONS.map((question) => [question.id, question])
);

const pickBestQuestion = (entries: FernEntry[], answeredIds: Set<string>) => {
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
  const currentImage = currentQuestion
    ? QUESTION_IMAGES[currentQuestion.id]
    : null;

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
                visual and growth-form notes from the database. Choose the
                closest match if you are unsure.
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

                  {currentQuestion.definition ? (
                    <div className="rounded-xl bg-[#f3f7f4] px-4 py-3 text-xs text-gray-600">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1f4d3a]">
                        Definition
                      </p>
                      <p className="mt-2">{currentQuestion.definition}</p>
                    </div>
                  ) : null}

                  {currentImage ? (
                    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#e2e8e0]">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="h-24 w-32 overflow-hidden rounded-xl bg-[#f3f7f4]">
                          <img
                            src={currentImage.src}
                            alt={currentImage.alt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1f4d3a]">
                            Reference image
                          </p>
                          <p className="text-xs text-gray-600">
                            Visual cue for the current step.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleChoice(true)}
                      className="rounded-2xl border border-[#c7d9cf] bg-white px-4 py-4 text-left text-sm font-semibold text-[#1f4d3a] shadow-sm transition hover:border-[#1f4d3a]"
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
                      <p className="mt-1 text-xs text-gray-600">
                        {answer.label}
                      </p>
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
