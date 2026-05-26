import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Layout from "../components/Layout";
import StatusTag from "../components/StatusTag";
import { fetchFerns } from "../api/fetchFerns";
import type { FernRecord } from "../types/Ferns";
import { commonNamesOf, primaryImageOf, statusOf } from "../utils/format";

/* ------------------------------------------------------------------ *
   Identification logic, preserved from the original dichotomous key.
 * ------------------------------------------------------------------ */

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

type FernEntry = { fern: FernRecord; traits: FernTraits };

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

type KeyAnswer = { questionId: string; choice: boolean; label: string };

const QUESTION_IMAGES: Record<string, { src: string; alt: string }> = {
  "tree-fern": { src: "/key/tree-fern.jpg", alt: "Tree fern with trunk and crown of fronds" },
  "filmy-fern": { src: "/key/filmy-fern.jpg", alt: "Filmy fern with translucent fronds" },
  maidenhair: { src: "/key/maidenhair.jpg", alt: "Maidenhair fern with fan-shaped leaflets" },
  "highly-divided": { src: "/key/highly-divided.jpg", alt: "Fern with finely divided fronds" },
  "simple-frond": { src: "/key/simple-frond.jpg", alt: "Fern with simple, strap-like fronds" },
  leathery: { src: "/key/leathery.jpg", alt: "Fern with thick, leathery fronds" },
  epiphyte: { src: "/key/epiphyte.jpg", alt: "Epiphytic fern growing on a trunk" },
  climbing: { src: "/key/climbing.jpg", alt: "Climbing fern" },
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildTraits = (fern: FernRecord): FernTraits => {
  const habitat = fern.habitat ?? fern.notes?.habitat ?? null;
  const notesText = fern.notesText ?? null;
  const commonNames = fern.commonNames ?? [];
  const synonyms = fern.synonyms ?? [];
  const combinedText = [
    fern.scientificName,
    fern.family,
    habitat,
    fern.recognition,
    notesText,
    commonNames.join(" "),
    synonyms.join(" "),
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
  { id: "tree-fern", prompt: "Does it form a trunk (tree fern)?", description: "Look for a distinct trunk with a crown of fronds.", definition: "Tree ferns have a vertical trunk with fronds forming a crown at the top.", yesLabel: "Yes, a trunked tree fern", noLabel: "No, ground or creeping fern", priority: 0, predicate: (e) => e.traits.isTreeFern },
  { id: "filmy-fern", prompt: "Are the fronds paper-thin and translucent?", description: "Filmy ferns have delicate, see-through fronds.", definition: "Filmy fronds are one cell thick and look almost transparent.", yesLabel: "Yes, filmy fronds", noLabel: "No, thicker fronds", priority: 0, predicate: (e) => e.traits.isFilmy },
  { id: "maidenhair", prompt: "Do the fronds have fan-shaped leaflets?", description: "Maidenhair ferns have delicate, fan-like leaflets.", definition: "Look for fan-shaped leaflets on thin, dark stalks.", yesLabel: "Yes, fan-shaped leaflets", noLabel: "No, other frond shape", priority: 0, predicate: (e) => e.traits.isMaidenhair },
  { id: "highly-divided", prompt: "Are the fronds very finely divided?", description: "Look for bipinnate or tripinnate fronds.", definition: "Bipinnate or tripinnate fronds split into many small leaflets, giving a lacy look.", yesLabel: "Yes, finely divided", noLabel: "No, less divided", priority: 0, predicate: (e) => e.traits.isHighlyDivided },
  { id: "simple-frond", prompt: "Are the fronds simple or strap-like?", description: "Undivided or ribbon-like fronds.", definition: "Simple fronds are undivided, often strap-like or tongue-shaped.", yesLabel: "Yes, simple fronds", noLabel: "No, divided fronds", priority: 0, predicate: (e) => e.traits.isSimpleFrond },
  { id: "scaly", prompt: "Are the fronds or stipes noticeably scaly or hairy?", description: "Look for obvious scales or bristles.", definition: "Scales or hairs are visible on the stipe or rachis, often brown or reddish.", yesLabel: "Yes, scaly or hairy", noLabel: "No, mostly smooth", priority: 1, predicate: (e) => e.traits.isScalyOrHairy },
  { id: "leathery", prompt: "Are the fronds thick or leathery?", description: "Firm, stiff, or glossy fronds.", definition: "Leathery fronds feel thick, stiff, or glossy compared to thin fronds.", yesLabel: "Yes, thick / leathery", noLabel: "No, thin or delicate", priority: 1, predicate: (e) => e.traits.isLeathery },
  { id: "epiphyte", prompt: "Does it grow on trees or other plants?", description: "Epiphytes often sit on trunks or branches.", definition: "Epiphytes sit on trunks or branches rather than rooting in soil.", yesLabel: "Yes, often epiphytic", noLabel: "No, mostly terrestrial", priority: 2, predicate: (e) => e.traits.isEpiphyte },
  { id: "climbing", prompt: "Does it climb or scramble over other plants?", description: "Look for scrambling or twining fronds.", definition: "Climbers have long, twining fronds or stems that scramble over other plants.", yesLabel: "Yes, climbing", noLabel: "No, not climbing", priority: 2, predicate: (e) => e.traits.isClimbing },
  { id: "dimorphic", prompt: "Are fertile and sterile fronds noticeably different?", description: "Look for narrow fertile fronds and broader sterile fronds.", definition: "Dimorphic ferns have distinct fertile and sterile fronds.", yesLabel: "Yes, dimorphic fronds", noLabel: "No, fronds look similar", priority: 2, predicate: (e) => e.traits.isDimorphic },
  { id: "creeping", prompt: "Does it spread by a creeping rhizome or mat?", description: "Creeping rhizomes often form mats across surfaces.", definition: "Creeping rhizomes spread along the surface and can form mats.", yesLabel: "Yes, creeping / mat-forming", noLabel: "No, tufted or upright", priority: 2, predicate: (e) => e.traits.isCreeping },
  { id: "linear-sori", prompt: "Are the sori arranged in long lines?", description: "Look for elongated sori rather than round dots.", definition: "Linear sori appear as lines instead of round dots.", yesLabel: "Yes, linear sori", noLabel: "No, round or scattered", priority: 2, predicate: (e) => e.traits.isLinearSori },
  { id: "marginal-sori", prompt: "Are the sori right on the frond margins?", description: "Marginal sori often sit on the very edge of the frond.", definition: "Marginal sori sit on the leaf edge, sometimes under a rolled margin.", yesLabel: "Yes, marginal sori", noLabel: "No, sori away from edges", priority: 2, predicate: (e) => e.traits.isMarginalSori },
];

const QUESTIONS_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

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
    return [{ question, balance: Math.abs(yesCount - noCount) }];
  });
  if (candidates.length === 0) return null;
  const minPriority = Math.min(...candidates.map((c) => c.question.priority));
  const priorityCandidates = candidates.filter(
    (c) => c.question.priority === minPriority
  );
  priorityCandidates.sort((a, b) => a.balance - b.balance);
  return priorityCandidates[0]?.question ?? null;
};

/* ------------------------------------------------------------------ *
   Identification console, presentation
 * ------------------------------------------------------------------ */

function CandidateRow({ fern, n }: { fern: FernRecord; n: number }) {
  const img = primaryImageOf(fern);
  return (
    <Link
      to={`/ferns/${encodeURIComponent(fern.scientificName)}`}
      className="group flex items-center gap-3 border-b border-line py-2.5 last:border-b-0"
    >
      <span className="w-6 shrink-0 font-mono text-[11px] text-ink-3">
        {String(n).padStart(2, "0")}
      </span>
      <span className="h-10 w-10 shrink-0 overflow-hidden border border-line bg-paper-2">
        {img ? (
          <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] italic text-ink group-hover:text-fern">
          {fern.scientificName}
        </span>
        <span className="block truncate font-mono text-[11px] text-ink-3">
          {fern.family}
        </span>
      </span>
      <StatusTag status={statusOf(fern)} variant="code" />
    </Link>
  );
}

export default function Identify() {
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
    () => ferns.map((fern) => ({ fern, traits: buildTraits(fern) })),
    [ferns]
  );
  const answeredIds = useMemo(
    () => new Set(answers.map((a) => a.questionId)),
    [answers]
  );
  const filteredEntries = useMemo(
    () =>
      fernEntries.filter((entry) =>
        answers.every((answer) => {
          const q = QUESTIONS_BY_ID.get(answer.questionId);
          if (!q) return true;
          return answer.choice ? q.predicate(entry) : !q.predicate(entry);
        })
      ),
    [fernEntries, answers]
  );
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

  const total = fernEntries.length || 1;
  const matchCount = filteredEntries.length;
  const progress = Math.round((1 - matchCount / total) * 100);
  const currentImage = currentQuestion ? QUESTION_IMAGES[currentQuestion.id] : null;
  const candidates = filteredEntries.slice(0, 12);

  return (
    <Layout>
      {/* Header */}
      <header className="border-b-2 border-ink py-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="label">Interactive key · Dichotomous</span>
            <h1 className="mt-3 text-[2.25rem] font-extrabold leading-[0.95] tracking-[-0.02em] md:text-[3.25rem]">
              Identify a fern
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">
              Answer each question from what you can see. The key narrows the
              archive after every choice. Pick the closest match if unsure, you
              can step back at any point.
            </p>
          </div>
          <div className="text-right">
            <div className="label">Candidates</div>
            <div className="mt-1 text-[3.5rem] font-extrabold leading-none tabular-nums tracking-[-0.03em]">
              {isLoading ? "–" : matchCount}
            </div>
            <div className="mt-1 font-mono text-[12px] text-ink-3">of {total}</div>
          </div>
        </div>
        <div className="mt-6 h-1 w-full bg-paper-2">
          <div
            className="h-full bg-fern transition-all duration-500"
            style={{ width: `${isLoading ? 0 : progress}%` }}
          />
        </div>
      </header>

      {error ? (
        <div className="py-16">
          <span className="label text-alert">Error</span>
          <p className="mt-3 text-lg">{error}</p>
        </div>
      ) : (
        <div className="grid gap-10 py-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Console */}
          <div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="label">Step {answers.length + 1}</span>
              <span className="font-mono text-[12px] text-ink-3">
                {matchCount} remaining
              </span>
            </div>

            {isLoading ? (
              <p className="py-16 font-mono text-[13px] text-ink-3">
                Loading the key…
              </p>
            ) : matchCount === 0 ? (
              <div className="py-12">
                <h2 className="text-2xl font-extrabold tracking-[-0.02em]">
                  No matches left
                </h2>
                <p className="mt-3 max-w-md text-[15px] text-ink-2">
                  That combination of traits rules out every species. Step back
                  to your last choice, or reset and start again.
                </p>
              </div>
            ) : currentQuestion ? (
              <div className="py-8">
                <h2 className="max-w-xl text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]">
                  {currentQuestion.prompt}
                </h2>
                {currentQuestion.definition ? (
                  <div className="mt-4 border-l-2 border-line-2 pl-4">
                    <span className="label">Definition</span>
                    <p className="mt-1 max-w-lg text-[14px] leading-relaxed text-ink-2">
                      {currentQuestion.definition}
                    </p>
                  </div>
                ) : null}

                {currentImage ? (
                  <div className="mt-6 flex items-center gap-4 border border-line bg-card p-3">
                    <img
                      src={currentImage.src}
                      alt={currentImage.alt}
                      loading="lazy"
                      className="h-20 w-28 shrink-0 border border-line object-cover"
                    />
                    <div>
                      <span className="label">Reference</span>
                      <p className="mt-1 text-[13px] text-ink-2">
                        A typical example of this trait.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-7 grid grid-cols-1 gap-px border border-line-2 bg-line-2 sm:grid-cols-2">
                  <button
                    onClick={() => handleChoice(true)}
                    className="group bg-paper p-5 text-left transition-colors hover:bg-fern-soft"
                  >
                    <span className="label group-hover:text-fern">Yes ✓</span>
                    <span className="mt-2 block text-[16px] font-medium text-ink">
                      {currentQuestion.yesLabel}
                    </span>
                  </button>
                  <button
                    onClick={() => handleChoice(false)}
                    className="group bg-paper p-5 text-left transition-colors hover:bg-paper-2"
                  >
                    <span className="label">No ✕</span>
                    <span className="mt-2 block text-[16px] font-medium text-ink">
                      {currentQuestion.noLabel}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Resolved to a single (or indivisible) match */
              <Resolved entry={filteredEntries[0]} count={matchCount} />
            )}

            <div className="flex items-center gap-3 border-t border-line pt-5">
              <button
                onClick={() => setAnswers((p) => p.slice(0, -1))}
                disabled={answers.length === 0}
                className="border border-line-2 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.04em] text-ink transition-colors enabled:hover:border-ink disabled:cursor-not-allowed disabled:text-ink-3"
              >
                ← Back
              </button>
              <button
                onClick={() => setAnswers([])}
                disabled={answers.length === 0}
                className="px-4 py-2 font-mono text-[12px] uppercase tracking-[0.04em] text-ink-3 transition-colors enabled:hover:text-ink disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Aside: path + candidates */}
          <aside className="flex flex-col gap-8">
            <div>
              <div className="border-b-2 border-ink pb-2">
                <span className="label">Decision path</span>
              </div>
              {answers.length === 0 ? (
                <p className="py-4 text-[13px] text-ink-3">
                  No choices yet. Start with the first question.
                </p>
              ) : (
                <ol>
                  {answers.map((answer, i) => {
                    const q = QUESTIONS_BY_ID.get(answer.questionId);
                    return (
                      <li
                        key={`${answer.questionId}-${i}`}
                        className="flex gap-3 border-b border-line py-2.5"
                      >
                        <span className="font-mono text-[11px] text-ink-3">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] text-ink-3">
                            {q?.prompt}
                          </span>
                          <span className="block text-[13px] font-medium text-ink">
                            {answer.choice ? "✓ " : "✕ "}
                            {answer.label}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between border-b-2 border-ink pb-2">
                <span className="label">Candidates</span>
                {matchCount > candidates.length ? (
                  <span className="font-mono text-[11px] text-ink-3">
                    {candidates.length} of {matchCount}
                  </span>
                ) : null}
              </div>
              {isLoading ? null : candidates.length === 0 ? (
                <p className="py-4 text-[13px] text-ink-3">No candidates.</p>
              ) : (
                candidates.map((entry, i) => (
                  <CandidateRow
                    key={entry.fern.scientificName}
                    fern={entry.fern}
                    n={i + 1}
                  />
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </Layout>
  );
}

function Resolved({ entry, count }: { entry?: FernEntry; count: number }) {
  if (!entry) return null;
  const fern = entry.fern;
  const img = primaryImageOf(fern);
  const common = commonNamesOf(fern);
  return (
    <div className="py-8">
      <span className="label text-fern">
        {count === 1 ? "Single match" : "Closest matches"}
      </span>
      <div className="mt-4 flex flex-col gap-5 border border-line bg-card p-4 sm:flex-row">
        <div className="h-40 w-full shrink-0 overflow-hidden border border-line bg-paper-2 sm:w-40">
          {img ? (
            <img src={img} alt={fern.scientificName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-[11px] text-ink-3">
              No plate
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-[1.75rem] font-extrabold italic leading-tight tracking-[-0.02em]">
            {fern.scientificName}
          </h2>
          <p className="mt-1 font-mono text-[12px] uppercase tracking-wide text-ink-3">
            {fern.family}
          </p>
          {common ? <p className="mt-2 text-[14px] text-ink-2">{common}</p> : null}
          <div className="mt-3">
            <StatusTag status={statusOf(fern)} />
          </div>
          <Link
            to={`/ferns/${encodeURIComponent(fern.scientificName)}`}
            className="mt-5 inline-block bg-ink px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-paper transition-colors hover:bg-fern"
          >
            View full record →
          </Link>
        </div>
      </div>
    </div>
  );
}
