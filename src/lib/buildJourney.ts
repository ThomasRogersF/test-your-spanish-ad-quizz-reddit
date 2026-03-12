/**
 * Content + logic engine for the "Based on your answers…" section.
 * Produces four data-driven cards from the computed level and graded answers.
 */

import type { ResultTemplate as QuizResultTemplate } from "@/types/quiz";

export type LevelKey = "a1" | "a2" | "b1" | "b2";
export type SkillKey = "vocab" | "grammar" | "listening" | "usage";

/**
 * Graded answer shape for journey builder
 * q is the numeric id extracted from questionId (e.g., q13 -> 13)
 */
export type JourneyAnswer = { q: number; isCorrect: boolean; value?: string };

/**
 * Optional additional context to adapt copy/meters
 */
export type JourneyUserContext = {
  motivation?: "Travel" | "Family" | "Career" | "School";
  minsPerDay?: number; // default 20
  availability?: string[]; // E.g., ["Tue 6–9pm","Thu 6–9pm"]
};

export type CardContent = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  chips?: string[];
  progress?: { current: number; target: number; label?: string };
  stat?: { label: string; value: string };
  cta?: { label: string; sub?: string };
  footnote?: string;
};

export type JourneyData = {
  levelId: LevelKey;
  levelTitle: string;
  levelDescription: string;
  totals: {
    totalCorrect: number;
    byLevel: Record<LevelKey, number>;
    bySkillPct: Record<SkillKey, number>; // 0–100
  };
  weakTopics: string[];
  strongTopics: string[];
  cards: {
    startingLevel: CardContent;
    focusPlan: CardContent;
    timeline: CardContent;
    proofTutor: CardContent;
  };
};

// ---------- Question metadata (aligned with sampleQuiz inventory) ----------
/**
 * For each question number, define its level, presentation type, skill tags, and topics.
 * This powers by-skill% and weak/strong topic summaries.
 */
const QUESTION_META: Record<
  number,
  {
    level: LevelKey;
    type: "mcq" | "image" | "audio" | "fill";
    skills: SkillKey[];
    topics: string[];
  }
> = {
  // A1
  1:  { level: "a1", type: "mcq",   skills: ["vocab", "usage"], topics: ["greetings", "introductions"] },
  3:  { level: "a1", type: "fill",  skills: ["grammar"],        topics: ["present tense", "tener (3rd)"] },
  5:  { level: "a1", type: "mcq",   skills: ["usage"],          topics: ["sentence correctness (A1)"] },

  // A2
  7:  { level: "a2", type: "mcq",   skills: ["grammar", "usage"], topics: ["preterite vs imperfect", "motion verbs"] },
  8:  { level: "a2", type: "mcq",   skills: ["usage"],            topics: ["prepositions", "para/por", "ti"] },
  12: { level: "a2", type: "audio", skills: ["listening"],         topics: ["accomplishments (present perfect)"] },

  // B1
  13: { level: "b1", type: "mcq",  skills: ["grammar", "usage"], topics: ["duration structures", "progressive/perfect aspect"] },
  15: { level: "b1", type: "fill", skills: ["grammar"],          topics: ["subjunctive (present)", "saber (tú)"] },
  17: { level: "b1", type: "mcq",  skills: ["usage"],            topics: ["sentence correctness (B1)"] },

  // B2
  19: { level: "b2", type: "mcq", skills: ["usage", "grammar"], topics: ["se accidental", "involuntary actions"] },
  20: { level: "b2", type: "mcq", skills: ["grammar"],          topics: ["third conditional", "counterfactuals"] },
  25: { level: "b2", type: "mcq", skills: ["grammar", "usage"], topics: ["IOP+DOP replacement", "se + lo/la"] }
};

// ---------- Copy dictionaries ----------
const LEVEL_COPY: Record<LevelKey, { label: string; now: string; next: string; nextLevel?: LevelKey }> = {
  a1: {
    label: "Beginner",
    now: "greet and understand set phrases",
    next: "order and introduce yourself smoothly",
    nextLevel: "a2"
  },
  a2: {
    label: "Elementary",
    now: "handle routine tasks & common phrases",
    next: "talk about past/future plans with confidence",
    nextLevel: "b1"
  },
  b1: {
    label: "Intermediate",
    now: "manage everyday situations & explain opinions",
    next: "tell stories in past tenses with fewer errors",
    nextLevel: "b2"
  },
  b2: {
    label: "Upper-Intermediate",
    now: "hold spontaneous conversations with natives",
    next: "polish speed, accuracy, and complex structures"
  }
};

const MILESTONES: Record<NonNullable<JourneyUserContext["motivation"]>, string[]> = {
  Travel: [
    "Introduce yourself + ask 3 key travel questions",
    "Order and resolve a simple issue without switching to English",
    "Tell a short past-tense story with <3 errors/min"
  ],
  Family: [
    "Greet and ask wellbeing questions naturally",
    "Hold a 5-minute chat with a relative",
    "Describe a recent family event in past tense"
  ],
  Career: [
    "Run a basic check-in with a colleague",
    "Schedule a meeting and confirm details",
    "Lead a 10-minute standup with clear actions"
  ],
  School: ["Introduce yourself to classmates", "Summarize a short article", "Present a 1-minute topic in Spanish"]
};

// ---------- Public builder ----------
export function buildJourney(params: {
  personalizedResult: Pick<QuizResultTemplate, "id" | "title" | "description">; // from getPersonalizedResult()
  answers: JourneyAnswer[]; // with isCorrect flags
  user?: JourneyUserContext; // optional personalization
  proof?: { ratingText?: string; classesTaughtText?: string }; // allow external proof strings
}): JourneyData {
  const { personalizedResult, answers, user, proof } = params;
  const levelId = (personalizedResult.id || "a1").toLowerCase() as LevelKey;
  const levelKey: LevelKey = ["a1", "a2", "b1", "b2"].includes(levelId) ? levelId : "a1";

  // Tallies
  const byLevel: Record<LevelKey, number> = { a1: 0, a2: 0, b1: 0, b2: 0 };
  const skillTallies: Record<SkillKey, { correct: number; total: number }> = {
    vocab: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
    usage: { correct: 0, total: 0 }
  };
  const topicScore: Record<string, { correct: number; total: number; level: LevelKey }> = {};

  for (const a of answers || []) {
    const meta = QUESTION_META[a.q];
    if (!meta) continue;

    if (a.isCorrect) byLevel[meta.level] += 1;

    for (const s of meta.skills) {
      skillTallies[s].total += 1;
      if (a.isCorrect) skillTallies[s].correct += 1;
    }
    for (const t of meta.topics) {
      if (!topicScore[t]) topicScore[t] = { correct: 0, total: 0, level: meta.level };
      topicScore[t].total += 1;
      if (a.isCorrect) topicScore[t].correct += 1;
    }
  }

  const totalCorrect = (answers || []).filter((a) => a.isCorrect).length;
  const bySkillPct = (Object.keys(skillTallies) as SkillKey[]).reduce((acc, k) => {
    const { correct, total } = skillTallies[k];
    acc[k] = total ? Math.round((correct / total) * 100) : 0;
    return acc;
  }, {} as Record<SkillKey, number>);

  // Topic ranking with slight weight for higher-level misses/hits
  const weight: Record<LevelKey, number> = { a1: 1.0, a2: 1.1, b1: 1.2, b2: 1.3 };
  const entries = Object.entries(topicScore);

  const weakTopics = entries
    .map(([topic, sc]) => ({ topic, miss: (sc.total - sc.correct) * weight[sc.level] }))
    .sort((a, b) => b.miss - a.miss)
    .filter((x) => x.miss > 0)
    .slice(0, 3)
    .map((x) => x.topic);

  const strongTopics = entries
    .map(([topic, sc]) => ({ topic, hit: sc.correct * weight[sc.level] }))
    .sort((a, b) => b.hit - a.hit)
    .slice(0, 3)
    .map((x) => x.topic);

  // Progress to next level (how much of the next band they already got right)
  const nextBand = LEVEL_COPY[levelKey].nextLevel;
  const bandTotals: Record<LevelKey, number> = { a1: 3, a2: 3, b1: 3, b2: 3 };
  const pctToNext = nextBand ? Math.round((byLevel[nextBand] / bandTotals[nextBand]) * 100) : 100;

  // Readiness index blends skills (grammar heavier)
  const readiness = Math.round(
    0.4 * bySkillPct.grammar + 0.25 * bySkillPct.vocab + 0.25 * bySkillPct.listening + 0.1 * bySkillPct.usage
  );

  const mins = user?.minsPerDay ?? 20;
  const mot = user?.motivation ?? "Travel";
  const milestones = MILESTONES[mot];

  // ----- Cards -----
  const c1: CardContent = {
    title: `You placed at ${personalizedResult.title}`,
    subtitle: `Right now you can ${LEVEL_COPY[levelKey].now}. With a dedicated SpanishVIP tutor, you’ll ${LEVEL_COPY[levelKey].next}.`,
    chips: strongTopics.length ? strongTopics.slice(0, 2) : ["Consistency", "Motivation"],
    progress: {
      current: pctToNext,
      target: 100,
      label: nextBand ? `Toward ${nextBand.toUpperCase()}` : "Maxed for this quiz"
    },
    cta: {
      label: "Book your free 1:1 class",
      sub: "We’ll tailor your plan live with a licensed native teacher."
    },
    footnote: [user?.availability?.[0] ? `Earliest: ${user.availability[0]}` : undefined, proof?.ratingText, proof?.classesTaughtText]
      .filter(Boolean)
      .join(" • ") || undefined
  };

  const targetWpm = bySkillPct.listening < 50 ? 90 : bySkillPct.listening < 75 ? 110 : 130;
  const quickWins =
    weakTopics.length ? weakTopics : ["listening practice", "core verbs", "high-frequency phrases"];

  const c2: CardContent = {
    title: "Your personalized plan (4 weeks)",
    bullets: [
      `Week 1: Fix ${quickWins[0]} with bite-size drills + live speaking reps.`,
      `Week 2: Master ${quickWins[1] ?? "core verbs (past)"} through tutor role-plays.`,
      `Weeks 3–4: Raise listening to ~${targetWpm} wpm with curated clips + feedback.`
    ],
    chips: quickWins.slice(0, 3),
    cta: { label: "See this plan in your free class", sub: "Your tutor adapts it to your availability." }
  };

  const c3: CardContent = {
    title: "In your first 14 days with SpanishVIP",
    bullets: milestones,
    progress: { current: mins, target: 30, label: `Time needed: ${mins} min/day` },
    cta: {
      label: "Prefer groups? Start a free group session",
      sub: "Unlimited weekday sessions; join live practice."
    }
  };

  const c4: CardContent = {
    title: "Why learners stay with SpanishVIP",
    stat: { label: "Readiness", value: `${readiness}%` },
    subtitle:
      "Get matched with a licensed native teacher and a plan built around your goals. Pause anytime; clear, flexible options.",
    cta: {
      label: "Book your free 1:1 class",
      sub: user?.availability?.[0] ? `Earliest: ${user.availability[0]}` : "No card required"
    },
    footnote: [proof?.classesTaughtText, proof?.ratingText].filter(Boolean).join(" • ") || undefined
  };

  return {
    levelId: levelKey,
    levelTitle: personalizedResult.title,
    levelDescription: personalizedResult.description,
    totals: {
      totalCorrect,
      byLevel,
      bySkillPct
    },
    weakTopics: quickWins.slice(0, 3),
    strongTopics,
    cards: { startingLevel: c1, focusPlan: c2, timeline: c3, proofTutor: c4 }
  };
}