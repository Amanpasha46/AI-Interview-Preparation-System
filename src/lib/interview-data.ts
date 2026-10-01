export type InterviewType = "Technical" | "HR" | "Behavioral" | "Mixed";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type Question = {
  id: string;
  role: string;
  type: Exclude<InterviewType, "Mixed">;
  topic: string;
  difficulty: Difficulty;
  prompt: string;
  concepts: { label: string; keywords: string[] }[];
  sampleAnswer: string;
};

export type Evaluation = {
  relevance: number;
  technical: number;
  completeness: number;
  clarity: number;
  conceptCoverage: number;
  overall: number;
  matched: string[];
  missing: string[];
  strengths: string[];
  improvements: string[];
  note: string;
};

export type SessionSummary = {
  id: string;
  date: string;
  role: string;
  type: InterviewType;
  difficulty: Difficulty;
  questions: number;
  score: number;
  topics: string[];
};

export const roles = [
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Software Developer",
  "Web Developer",
  "Business Analyst",
] as const;

export const roleTopics: Record<string, string[]> = {
  "Data Analyst": ["SQL", "Excel", "Power BI", "Statistics", "Python", "Data Cleaning", "Data Visualization"],
  "Data Scientist": ["Python", "Statistics", "Machine Learning", "Pandas", "NumPy", "Model Evaluation", "Feature Engineering"],
  "Machine Learning Engineer": ["Machine Learning", "Deep Learning", "Python", "Scikit-learn", "Model Deployment", "MLOps", "Model Evaluation"],
  "AI Engineer": ["Python", "NLP", "Model Evaluation", "Prompt Design", "Machine Learning", "APIs", "Responsible AI"],
  "Software Developer": ["Data Structures", "Algorithms", "OOP", "APIs", "Testing", "Databases", "System Design"],
  "Web Developer": ["HTML", "CSS", "JavaScript", "React", "Accessibility", "Web Performance", "APIs"],
  "Business Analyst": ["Requirements", "Stakeholders", "Metrics", "Process Mapping", "SQL", "Communication", "Prioritization"],
};

const baseQuestions: Question[] = [
  {
    id: "da-sql-joins",
    role: "Data Analyst",
    type: "Technical",
    topic: "SQL",
    difficulty: "Medium",
    prompt: "Explain the difference between INNER JOIN and LEFT JOIN in SQL.",
    concepts: [
      { label: "INNER JOIN", keywords: ["inner join", "matching rows", "matches"] },
      { label: "LEFT JOIN", keywords: ["left join", "all rows from the left"] },
      { label: "Unmatched rows", keywords: ["unmatched", "no match", "null values", "null"] },
    ],
    sampleAnswer: "An INNER JOIN returns rows that match in both tables. A LEFT JOIN keeps every row from the left table and adds matching values from the right, using NULL when no match exists.",
  },
  {
    id: "da-cleaning",
    role: "Data Analyst",
    type: "Technical",
    topic: "Data Cleaning",
    difficulty: "Easy",
    prompt: "How would you approach a dataset with missing and inconsistent values?",
    concepts: [
      { label: "Profile the data", keywords: ["profile", "inspect", "explore", "missing"] },
      { label: "Choose a treatment", keywords: ["impute", "remove", "fill", "median", "mean"] },
      { label: "Validate the result", keywords: ["validate", "check", "quality", "document"] },
    ],
    sampleAnswer: "I would profile missingness first, understand why values are missing, choose removal or imputation based on context, then validate distributions and document the decision.",
  },
  {
    id: "ds-overfit",
    role: "Data Scientist",
    type: "Technical",
    topic: "Model Evaluation",
    difficulty: "Medium",
    prompt: "What is overfitting, and how would you detect and reduce it?",
    concepts: [
      { label: "Generalization", keywords: ["generalize", "unseen", "validation", "test"] },
      { label: "Training versus validation", keywords: ["training", "validation", "gap", "performance"] },
      { label: "Regularization", keywords: ["regularization", "dropout", "simpler", "early stopping"] },
    ],
    sampleAnswer: "Overfitting happens when a model learns training noise and performs poorly on unseen data. I would compare training and validation performance, then use cross-validation, regularization, simpler features, or early stopping.",
  },
  {
    id: "mle-deploy",
    role: "Machine Learning Engineer",
    type: "Technical",
    topic: "Model Deployment",
    difficulty: "Hard",
    prompt: "How would you safely deploy a machine learning model to production?",
    concepts: [
      { label: "Reproducible pipeline", keywords: ["pipeline", "version", "reproducible", "artifact"] },
      { label: "Monitoring", keywords: ["monitor", "drift", "latency", "logging"] },
      { label: "Rollback", keywords: ["rollback", "canary", "staging", "versioned"] },
    ],
    sampleAnswer: "I would package a versioned model with a reproducible pipeline, validate it in staging, release with a canary, monitor drift and latency, and keep a tested rollback path.",
  },
  {
    id: "ai-responsible",
    role: "AI Engineer",
    type: "Behavioral",
    topic: "Responsible AI",
    difficulty: "Hard",
    prompt: "Tell me how you would respond if an AI feature produced biased results for one user group.",
    concepts: [
      { label: "Investigate evidence", keywords: ["investigate", "audit", "measure", "data"] },
      { label: "Mitigate harm", keywords: ["mitigate", "fairness", "bias", "pause", "guardrail"] },
      { label: "Communicate clearly", keywords: ["stakeholder", "communicate", "transparent", "explain"] },
    ],
    sampleAnswer: "I would verify the pattern with subgroup metrics, pause or limit the risky behavior, investigate data and model causes, communicate the impact, and ship a measured mitigation with ongoing monitoring.",
  },
  {
    id: "sde-api",
    role: "Software Developer",
    type: "Technical",
    topic: "APIs",
    difficulty: "Medium",
    prompt: "What makes an API reliable for the clients that depend on it?",
    concepts: [
      { label: "Clear contract", keywords: ["contract", "schema", "documentation", "version"] },
      { label: "Failure handling", keywords: ["error", "timeout", "retry", "idempotent"] },
      { label: "Observability", keywords: ["logging", "metrics", "monitor", "trace"] },
    ],
    sampleAnswer: "A reliable API has a clear versioned contract, predictable errors and timeouts, safe retry behavior, validation, and enough logging and metrics to diagnose failures.",
  },
  {
    id: "web-a11y",
    role: "Web Developer",
    type: "Technical",
    topic: "Accessibility",
    difficulty: "Easy",
    prompt: "How do you make a web interface accessible to more people?",
    concepts: [
      { label: "Semantic HTML", keywords: ["semantic", "html", "landmark", "heading"] },
      { label: "Keyboard access", keywords: ["keyboard", "focus", "tab"] },
      { label: "Assistive technology", keywords: ["screen reader", "aria", "contrast"] },
    ],
    sampleAnswer: "I start with semantic HTML and a logical heading structure, ensure every action works with a keyboard, maintain visible focus and contrast, and test with a screen reader.",
  },
  {
    id: "ba-requirements",
    role: "Business Analyst",
    type: "Behavioral",
    topic: "Requirements",
    difficulty: "Medium",
    prompt: "How would you handle conflicting requirements from two important stakeholders?",
    concepts: [
      { label: "Clarify goals", keywords: ["goal", "clarify", "outcome", "requirement"] },
      { label: "Use evidence", keywords: ["data", "impact", "trade-off", "prioritize"] },
      { label: "Align and document", keywords: ["align", "document", "decision", "communicate"] },
    ],
    sampleAnswer: "I would clarify the shared outcome, make the trade-offs visible with evidence, facilitate an aligned decision, and document the agreed priority and next step.",
  },
];

const behavioralTemplates = [
  "Tell me about a time you had to explain a complex idea to someone without a technical background.",
  "Describe a project that did not go as planned. What did you change?",
  "Tell me about a time you used feedback to improve your work.",
];

export function buildQuestions(role: string, type: InterviewType, difficulty: Difficulty, count: number) {
  const roleQuestions = baseQuestions.filter((question) => question.role === role);
  const generated: Question[] = roleTopics[role].map((topic, index) => ({
    id: `${role.toLowerCase().replaceAll(" ", "-")}-${topic.toLowerCase().replaceAll(" ", "-")}-${index}`,
    role,
    type: index % 3 === 0 ? "Behavioral" : "Technical",
    topic,
    difficulty,
    prompt: `How would you apply ${topic} when working as a ${role}?`,
    concepts: [
      { label: topic, keywords: [topic.toLowerCase(), topic.toLowerCase().replaceAll(" ", "")] },
      { label: "Practical example", keywords: ["example", "project", "case", "scenario"] },
      { label: "Trade-off or outcome", keywords: ["trade-off", "impact", "outcome", "measure", "why"] },
    ],
    sampleAnswer: `I would connect ${topic} to the project goal, explain the decision in practical terms, and validate the outcome with evidence and a clear trade-off.`,
  }));
  const mixed = [...roleQuestions, ...generated];
  let filtered = mixed.filter((question) => {
    if (type === "Mixed") return true;
    if (type === "HR") return question.type === "Behavioral";
    if (type === "Behavioral") return question.type === "Behavioral";
    return question.type === "Technical";
  });
  if (filtered.length < count) filtered = [...filtered, ...mixed.filter((question) => !filtered.includes(question))];
  const unique = filtered.filter((question, index, list) => list.findIndex((item) => item.id === question.id) === index);
  const answer = unique.slice(0, count);
  return answer.length >= count ? answer : [...answer, ...generated.slice(0, count - answer.length)];
}

export function evaluateAnswer(answer: string, question: Question): Evaluation {
  const text = answer.trim().toLowerCase();
  const matched = question.concepts.filter((concept) => concept.keywords.some((keyword) => text.includes(keyword))).map((concept) => concept.label);
  const missing = question.concepts.filter((concept) => !matched.includes(concept.label)).map((concept) => concept.label);
  const coverage = Math.round((matched.length / question.concepts.length) * 100);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const relevance = Math.min(96, 48 + Math.min(42, wordCount * 2) + (matched.length ? 8 : 0));
  const technical = Math.min(96, 44 + coverage * 0.52);
  const completeness = Math.min(96, 42 + coverage * 0.54 + (wordCount > 55 ? 8 : 0));
  const clarity = Math.min(96, 58 + (wordCount > 20 ? 14 : 0) + (wordCount < 130 ? 9 : 0));
  const overall = Math.round((relevance + technical + completeness + clarity + coverage) / 5);
  return {
    relevance: Math.round(relevance),
    technical: Math.round(technical),
    completeness: Math.round(completeness),
    clarity: Math.round(clarity),
    conceptCoverage: coverage,
    overall,
    matched,
    missing,
    strengths: matched.length ? [`You addressed ${matched.join(", ")} with relevant context.`] : ["You started with a direct response to the prompt."],
    improvements: missing.length ? [`Add a clearer explanation of ${missing.join(", ")}.`] : ["Add one measurable outcome or concrete example to make the answer more memorable."],
    note: coverage >= 66 ? "Your answer covers the core of the question. Tighten the structure and add one concrete detail." : "Your answer is a useful start. Name the key concepts first, then support them with an example.",
  };
}

export const demoSessions: SessionSummary[] = [
  { id: "demo-1", date: "Today", role: "Data Scientist", type: "Behavioral", difficulty: "Medium", questions: 8, score: 84, topics: ["STAR", "Conflict"] },
  { id: "demo-2", date: "Yesterday", role: "Data Analyst", type: "Technical", difficulty: "Medium", questions: 10, score: 69, topics: ["SQL", "Statistics"] },
  { id: "demo-3", date: "28 Sep 2026", role: "Web Developer", type: "Mixed", difficulty: "Easy", questions: 6, score: 81, topics: ["Accessibility", "APIs"] },
];
