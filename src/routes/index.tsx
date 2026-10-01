import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BarChart3, BrainCircuit, Check, ChevronDown, CircleHelp, History, LayoutDashboard, Mic, Play, Radio, RotateCcw, Square, Target, TrendingUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildQuestions, demoSessions, evaluateAnswer, roleTopics, roles, type Difficulty, type Evaluation, type InterviewType, type Question, type SessionSummary } from "@/lib/interview-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prepwell — AI interview preparation studio" },
      { name: "description", content: "Practice role-specific interviews, submit answers, and review clearly labeled estimated feedback in a focused studio." },
      { property: "og:title", content: "Prepwell — AI interview preparation studio" },
      { property: "og:description", content: "Practice role-specific interviews with estimated answer feedback and performance insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrepwellApp,
});

type View = "dashboard" | "interview" | "reports" | "history";

function PrepwellApp() {
  const [view, setView] = useState<View>("dashboard");
  const [role, setRole] = useState<string>(roles[0]);
  const [type, setType] = useState<InterviewType>("Technical");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [sessionScores, setSessionScores] = useState<Evaluation[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>(demoSessions);
  const [isRecording, setIsRecording] = useState(false);
  const [speechMessage, setSpeechMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("prepwell-sessions");
      if (stored) setSessions([...JSON.parse(stored) as SessionSummary[], ...demoSessions]);
    } catch {
      setSessions(demoSessions);
    }
  }, []);

  const currentQuestion = questions[questionIndex];
  const isComplete = questions.length > 0 && questionIndex >= questions.length;
  const sessionAverage = sessionScores.length ? Math.round(sessionScores.reduce((sum, item) => sum + item.overall, 0) / sessionScores.length) : 0;
  const averageScore = sessions.length ? Math.round(sessions.reduce((sum, session) => sum + session.score, 0) / sessions.length) : 0;

  function startInterview() {
    const nextQuestions = buildQuestions(role, type, difficulty, count);
    setQuestions(nextQuestions);
    setQuestionIndex(0);
    setAnswer("");
    setEvaluation(null);
    setSessionScores([]);
    setSpeechMessage("");
    setView("interview");
  }

  function submitAnswer() {
    if (!currentQuestion || !answer.trim()) return;
    const nextEvaluation = evaluateAnswer(answer, currentQuestion);
    setEvaluation(nextEvaluation);
    setSessionScores((previous) => [...previous, nextEvaluation]);
  }

  function advanceQuestion() {
    if (!currentQuestion) return;
    if (questionIndex + 1 >= questions.length) {
      const finalScore = Math.round([...sessionScores].reduce((sum, item) => sum + item.overall, 0) / Math.max(1, sessionScores.length));
      const finished: SessionSummary = { id: `session-${Date.now()}`, date: "Just now", role, type, difficulty, questions: questions.length, score: finalScore, topics: questions.slice(0, 3).map((question) => question.topic) };
      const updated = [finished, ...sessions.filter((session) => !session.id.startsWith("demo-"))];
      setSessions(updated);
      window.localStorage.setItem("prepwell-sessions", JSON.stringify(updated));
      setQuestionIndex(questions.length);
      setView("reports");
      return;
    }
    setQuestionIndex((index) => index + 1);
    setAnswer("");
    setEvaluation(null);
    setSpeechMessage("");
  }

  function skipQuestion() {
    if (questionIndex + 1 >= questions.length) {
      setView("reports");
      return;
    }
    setQuestionIndex((index) => index + 1);
    setAnswer("");
    setEvaluation(null);
  }

  function toggleRecording() {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechMessage("Speech recognition is unavailable. You can enter your answer manually.");
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ");
      setAnswer((previous) => `${previous} ${transcript}`.trim());
    };
    recognition.onerror = () => {
      setSpeechMessage("Microphone access was not available. You can enter your answer manually.");
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setSpeechMessage("Listening… speak naturally, then stop when you are done.");
    setIsRecording(true);
  }

  return (
    <div className="app-wash min-h-screen overflow-x-hidden text-ink">
      <div className="pointer-events-none fixed -left-24 top-10 -z-0 size-72 rounded-full bg-teal/15 blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-1/3 -z-0 size-80 rounded-full bg-brand/15 blur-3xl" />
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <Sidebar view={view} onViewChange={setView} />
        <main className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">
          <MobileHeader view={view} onViewChange={setView} />
          {view === "dashboard" && <DashboardView role={role} type={type} difficulty={difficulty} count={count} setRole={setRole} setType={setType} setDifficulty={setDifficulty} setCount={setCount} onStart={startInterview} sessions={sessions} averageScore={averageScore} onViewChange={setView} />}
          {view === "interview" && !isComplete && currentQuestion && <InterviewView role={role} type={type} difficulty={difficulty} question={currentQuestion} questionIndex={questionIndex} total={questions.length} answer={answer} setAnswer={setAnswer} evaluation={evaluation} onSubmit={submitAnswer} onNext={advanceQuestion} onSkip={skipQuestion} isRecording={isRecording} toggleRecording={toggleRecording} speechMessage={speechMessage} onBack={() => setView("dashboard")} />}
          {view === "reports" && <ReportsView role={role} type={type} difficulty={difficulty} sessionAverage={sessionAverage} scores={sessionScores} sessions={sessions} onStart={startInterview} onViewChange={setView} />}
          {view === "history" && <HistoryView sessions={sessions} onViewChange={setView} />}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ view, onViewChange }: { view: View; onViewChange: (view: View) => void }) {
  const nav = [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { key: "interview", label: "New interview", icon: Play }, { key: "reports", label: "Reports", icon: BarChart3 }, { key: "history", label: "History", icon: History }] as const;
  return <aside className="glass-panel sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-y-0 border-l-0 px-4 py-6 md:flex">
    <div className="mb-6 flex items-center gap-2.5 px-2"><div className="grid size-9 place-items-center rounded-[10px] bg-brand text-sm font-semibold text-brand-foreground shadow-sm ring-1 ring-brand/30">P</div><div className="leading-tight"><p className="font-display text-[15px] font-medium">Prepwell</p><p className="text-[11px] text-ink/45">Interview studio</p></div></div>
    <nav className="flex flex-col gap-1 text-sm" aria-label="Main navigation">{nav.map(({ key, label, icon: Icon }) => <button key={key} type="button" onClick={() => onViewChange(key)} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${view === key ? "bg-brand/10 font-medium text-brand ring-1 ring-brand/15" : "text-ink/60 hover:bg-white/50 hover:text-ink"}`}><Icon className="size-4" />{label}</button>)}</nav>
    <div className="glass-inset mt-auto rounded-2xl p-4"><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/40">Demo mode</p><p className="mt-1.5 text-[13px] leading-snug text-ink/60">Local sample questions and estimated scoring keep practice available without an API key.</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10"><div className="h-full w-2/3 rounded-full bg-teal/80" /></div></div>
  </aside>;
}

function MobileHeader({ view, onViewChange }: { view: View; onViewChange: (view: View) => void }) {
  return <header className="mb-6 flex items-center justify-between gap-4 md:hidden"><button type="button" onClick={() => onViewChange("dashboard")} className="focus-ring flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-[10px] bg-brand text-sm font-semibold text-brand-foreground">P</span><span className="font-display text-[15px] font-medium">Prepwell</span></button><div className="flex items-center gap-2"><select aria-label="Navigate" value={view} onChange={(event) => onViewChange(event.target.value as View)} className="glass-inset rounded-lg px-2 py-2 text-xs"><option value="dashboard">Dashboard</option><option value="interview">New interview</option><option value="reports">Reports</option><option value="history">History</option></select><div className="grid size-9 place-items-center rounded-[10px] bg-teal/15 text-sm font-semibold text-teal ring-1 ring-teal/20">AV</div></div></header>;
}

function DashboardView({ role, type, difficulty, count, setRole, setType, setDifficulty, setCount, onStart, sessions, averageScore, onViewChange }: { role: string; type: InterviewType; difficulty: Difficulty; count: number; setRole: (value: string) => void; setType: (value: InterviewType) => void; setDifficulty: (value: Difficulty) => void; setCount: (value: number) => void; onStart: () => void; sessions: SessionSummary[]; averageScore: number; onViewChange: (view: View) => void }) {
  return <>
    <header className="mb-6 hidden items-center justify-between gap-4 md:flex"><div><p className="text-[13px] text-ink/50">Good afternoon, Amara</p><h1 className="font-display text-2xl font-semibold tracking-tight lg:text-[28px]">Your interview control room</h1></div><div className="flex items-center gap-3"><span className="rounded-full bg-white/60 px-3 py-1.5 text-[12px] font-medium text-ink/60 ring-1 ring-white/60 backdrop-blur">{sessions.length} sessions completed</span><div className="grid size-9 place-items-center rounded-[10px] bg-teal/15 text-sm font-semibold text-teal ring-1 ring-teal/20">AV</div></div></header>
    <div className="mb-5 md:hidden"><p className="text-[13px] text-ink/50">Good afternoon, Amara</p><h1 className="font-display text-2xl font-semibold tracking-tight">Your interview control room</h1></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <SetupCard role={role} type={type} difficulty={difficulty} count={count} setRole={setRole} setType={setType} setDifficulty={setDifficulty} setCount={setCount} onStart={onStart} />
      <WorkspacePreview onStart={onStart} />
    </div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><EvaluationPreview /><RecentSessions sessions={sessions} onViewChange={onViewChange} /></div>
    <FeatureStrip />
  </>;
}

function SetupCard({ role, type, difficulty, count, setRole, setType, setDifficulty, setCount, onStart }: { role: string; type: InterviewType; difficulty: Difficulty; count: number; setRole: (value: string) => void; setType: (value: InterviewType) => void; setDifficulty: (value: Difficulty) => void; setCount: (value: number) => void; onStart: () => void }) {
  return <section className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">Set up your session</h2><span className="rounded-full bg-teal/12 px-2.5 py-1 text-[11px] font-medium text-teal ring-1 ring-teal/20">{roleTopics[role].length} focus topics</span></div><div className="mt-4 space-y-3"><Field label="Target role"><select value={role} onChange={(event) => setRole(event.target.value)} className="glass-inset focus-ring w-full rounded-xl px-3 py-2.5 text-sm font-medium"><>{roles.map((item) => <option key={item}>{item}</option>)}</></select></Field><Field label="Interview type"><select value={type} onChange={(event) => setType(event.target.value as InterviewType)} className="glass-inset focus-ring w-full rounded-xl px-3 py-2.5 text-sm font-medium"><option>Technical</option><option>HR</option><option>Behavioral</option><option>Mixed</option></select></Field><div className="grid grid-cols-2 gap-3"><Field label="Difficulty"><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)} className="glass-inset focus-ring w-full rounded-xl px-3 py-2.5 text-sm font-medium"><option>Easy</option><option>Medium</option><option>Hard</option></select></Field><Field label="Questions"><select value={count} onChange={(event) => setCount(Number(event.target.value))} className="glass-inset focus-ring w-full rounded-xl px-3 py-2.5 text-sm font-medium"><option value={5}>5</option><option value={10}>10</option><option value={15}>15</option></select></Field></div><div className="glass-inset flex items-center justify-between rounded-xl px-3 py-2.5"><div><p className="text-[13px] font-medium">Speech capture</p><p className="text-[11px] text-ink/45">Browser speech-to-text when supported</p></div><span className="relative inline-flex h-5 w-9 items-center rounded-full bg-teal/80"><span className="absolute right-0.5 size-4 rounded-full bg-teal-foreground shadow-sm" /></span></div></div><Button type="button" onClick={onStart} className="mt-5 flex h-11 w-full rounded-xl bg-brand text-brand-foreground shadow-sm ring-1 ring-brand/30 hover:bg-brand/90"><Play className="size-4" />Start interview</Button><p className="mt-2 text-center text-[11px] text-ink/40">Runs fully in your browser · no sign-up</p></section>;
}

function WorkspacePreview({ onStart }: { onStart: () => void }) { return <section className="glass-panel flex flex-col rounded-3xl p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-teal/60" /><span className="relative inline-flex size-2.5 rounded-full bg-teal" /></span><h2 className="text-[15px] font-semibold">Live session</h2></div><span className="text-[12px] font-medium text-ink/50">Ready to begin</span></div><div className="mt-4"><div className="flex items-center justify-between text-[11px] text-ink/45"><span>Progress</span><span>0%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/8"><div className="h-full w-0 rounded-full bg-teal transition-[width] duration-500" /></div><div className="mt-2 flex gap-1">{Array.from({ length: 8 }).map((_, index) => <span key={index} className="h-1 flex-1 rounded-full bg-ink/10" />)}</div></div><div className="glass-inset mt-4 flex min-h-52 flex-1 flex-col justify-center rounded-2xl p-5 text-center"><div className="mx-auto grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand"><Radio className="size-5" /></div><p className="mt-3 text-[15px] font-medium">Your next question will appear here</p><p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink/55">Choose a role and format, then start a focused practice session with local demo questions.</p><Button type="button" variant="outline" onClick={onStart} className="mx-auto mt-4 rounded-xl border-white/70 bg-white/60">Preview a session <ArrowRight className="size-4" /></Button></div></section>; }

function EvaluationPreview() { return <section className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">Evaluation</h2><span className="rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-medium text-warning ring-1 ring-warning/20">Estimated · demo</span></div><div className="mt-4 flex items-center gap-5"><ScoreRing score={78} /><div className="flex-1 space-y-3"><Metric label="Relevance" score={84} color="brand" /><Metric label="Technical accuracy" score={72} color="brand" /><Metric label="Clarity" score={80} color="teal" /></div></div><div className="glass-inset mt-4 rounded-2xl p-3.5"><p className="text-[12px] font-medium text-ink/55">Estimated note</p><p className="mt-1 text-[13px] leading-relaxed text-ink/70">You will see strengths, missing concepts, and a suggested improvement after each answer.</p></div></section>; }

function RecentSessions({ sessions, onViewChange }: { sessions: SessionSummary[]; onViewChange: (view: View) => void }) { return <section className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between"><h2 className="text-[15px] font-semibold">Recent sessions</h2><button type="button" onClick={() => onViewChange("history")} className="focus-ring text-[12px] font-medium text-brand">View history</button></div><div className="mt-4 space-y-2.5">{sessions.slice(0, 3).map((session) => <SessionRow key={session.id} session={session} />)}</div></section>; }

function SessionRow({ session }: { session: SessionSummary }) { return <div className="glass-inset rounded-2xl p-3.5 transition hover:bg-white/80"><div className="flex items-center justify-between gap-3"><p className="truncate text-[13px] font-medium">{session.role} · {session.type}</p><span className="rounded-md bg-teal/12 px-2 py-0.5 text-[11px] font-semibold text-teal">{session.score}</span></div><div className="mt-1.5 flex items-center justify-between gap-3"><div className="flex gap-1.5 overflow-hidden">{session.topics.map((topic) => <span key={topic} className="rounded bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/50">{topic}</span>)}</div><span className="shrink-0 text-[11px] text-ink/40">{session.date}</span></div></div>; }

function FeatureStrip() { const features = [{ icon: BrainCircuit, label: "Role-specific questions", copy: "Curated question bank" }, { icon: Target, label: "Answer evaluation", copy: "Five score dimensions" }, { icon: Mic, label: "Speech-to-text", copy: "Optional browser input" }, { icon: TrendingUp, label: "Performance insights", copy: "Progress you can review" }]; return <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{features.map(({ icon: Icon, label, copy }) => <div key={label} className="glass-inset rounded-2xl p-4"><Icon className="size-4 text-brand" /><p className="mt-3 text-[13px] font-semibold">{label}</p><p className="mt-1 text-[11px] text-ink/50">{copy}</p></div>)}</section>; }

function InterviewView({ role, type, difficulty, question, questionIndex, total, answer, setAnswer, evaluation, onSubmit, onNext, onSkip, isRecording, toggleRecording, speechMessage, onBack }: { role: string; type: InterviewType; difficulty: Difficulty; question: Question; questionIndex: number; total: number; answer: string; setAnswer: (value: string) => void; evaluation: Evaluation | null; onSubmit: () => void; onNext: () => void; onSkip: () => void; isRecording: boolean; toggleRecording: () => void; speechMessage: string; onBack: () => void }) {
  const progress = Math.round((questionIndex / total) * 100);
  return <><header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><button type="button" onClick={onBack} className="focus-ring mb-2 inline-flex items-center gap-1 text-[12px] font-medium text-ink/55 hover:text-ink"><ArrowLeft className="size-3.5" />Back to setup</button><h1 className="font-display text-2xl font-semibold tracking-tight">Live interview</h1><p className="mt-1 text-[13px] text-ink/50">{role} · {type} · {difficulty}</p></div><span className="rounded-full bg-warning-soft px-3 py-1.5 text-[11px] font-medium text-warning ring-1 ring-warning/20">Demo mode · estimated scoring</span></header><section className="glass-panel rounded-3xl p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-teal/60" /><span className="relative inline-flex size-2.5 rounded-full bg-teal" /></span><h2 className="text-[15px] font-semibold">Question {questionIndex + 1} of {total}</h2></div><span className="text-[12px] font-medium text-ink/50">{progress}% complete</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/8"><div className="h-full rounded-full bg-gradient-to-r from-brand to-teal transition-[width] duration-500" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex gap-1">{Array.from({ length: Math.min(total, 15) }).map((_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index < questionIndex ? "bg-brand" : index === questionIndex ? "bg-teal" : "bg-ink/10"}`} />)}</div><div className="glass-inset mt-5 rounded-2xl p-5"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">{question.type}</span><span className="rounded-md bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/55">{question.topic}</span><span className="rounded-md bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/55">{question.difficulty}</span></div><p className="mt-3 text-xl font-medium leading-snug tracking-tight text-balance">{question.prompt}</p></div><div className="mt-4"><label htmlFor="answer" className="mb-1.5 block text-[12px] font-medium text-ink/55">Your answer</label><textarea id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer here. Aim for a clear explanation with one concrete example…" className="glass-inset focus-ring min-h-44 w-full resize-y rounded-xl px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-ink/35" /><div className="mt-2 flex flex-wrap items-center gap-2"><Button type="button" variant="outline" onClick={toggleRecording} className={`rounded-lg border-white/70 bg-white/60 ${isRecording ? "text-warning" : "text-ink/70"}`}>{isRecording ? <Square className="size-3.5 fill-current" /> : <Mic className="size-3.5" />}{isRecording ? "Stop recording" : "Record answer"}</Button><span className="text-[11px] text-ink/45">{answer.trim().split(/\s+/).filter(Boolean).length} words</span><Button type="button" onClick={onSubmit} disabled={!answer.trim() || Boolean(evaluation)} className="ml-auto rounded-lg bg-teal text-teal-foreground ring-1 ring-teal/30 hover:bg-teal/90">Submit answer <ArrowRight className="size-4" /></Button></div>{speechMessage && <p className="mt-2 text-[11px] text-warning">{speechMessage}</p>}</div>{evaluation && <EvaluationCard evaluation={evaluation} sampleAnswer={question.sampleAnswer} onNext={onNext} onSkip={onSkip} isLast={questionIndex + 1 === total} />}</section></>;
}

function EvaluationCard({ evaluation, sampleAnswer, onNext, onSkip, isLast }: { evaluation: Evaluation; sampleAnswer: string; onNext: () => void; onSkip: () => void; isLast: boolean }) { return <div className="mt-5 border-t border-white/70 pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><h2 className="text-[15px] font-semibold">Answer evaluation</h2><span className="rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-medium text-warning">Estimated · demo</span></div><span className="font-display text-2xl font-semibold text-teal">{evaluation.overall}<span className="font-body text-xs text-ink/45"> / 100</span></span></div><div className="mt-4 grid gap-3 sm:grid-cols-5">{[["Relevance", evaluation.relevance], ["Technical", evaluation.technical], ["Complete", evaluation.completeness], ["Clarity", evaluation.clarity], ["Concepts", evaluation.conceptCoverage]].map(([label, score]) => <div key={label} className="glass-inset rounded-xl p-3"><p className="text-[11px] text-ink/50">{label}</p><p className="mt-1 font-display text-xl font-semibold">{score}</p><div className="mt-2 h-1 rounded-full bg-ink/8"><div className="h-full rounded-full bg-teal" style={{ width: `${score}%` }} /></div></div>)}</div><p className="mt-4 text-[13px] leading-relaxed text-ink/70">{evaluation.note}</p><div className="mt-4 grid gap-3 md:grid-cols-2"><FeedbackList title="Strengths" items={evaluation.strengths} icon={<Check className="size-3.5" />} tone="success" /><FeedbackList title="Areas to improve" items={[...evaluation.improvements, ...(evaluation.missing.length ? [`Missing concepts: ${evaluation.missing.join(", ")}.`] : [])]} icon={<AlertIcon />} tone="warning" /></div><div className="glass-inset mt-3 rounded-xl p-3.5"><p className="text-[11px] font-medium text-ink/50">Example strong answer</p><p className="mt-1 text-[12px] leading-relaxed text-ink/70">{sampleAnswer}</p></div><div className="mt-4 flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={onSkip} className="rounded-lg border-white/70 bg-white/60">Skip next</Button><Button type="button" onClick={onNext} className="rounded-lg bg-brand text-brand-foreground">{isLast ? "Finish interview" : "Next question"}<ArrowRight className="size-4" /></Button></div></div>; }

function FeedbackList({ title, items, icon, tone }: { title: string; items: string[]; icon: React.ReactNode; tone: "success" | "warning" }) { return <div className="glass-inset rounded-xl p-3.5"><p className={`text-[12px] font-semibold ${tone === "success" ? "text-success" : "text-warning"}`}>{title}</p><ul className="mt-2 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink/65"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${tone === "success" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>{icon}</span>{item}</li>)}</ul></div>; }
function AlertIcon() { return <span className="text-xs font-bold">!</span>; }

function ReportsView({ role, type, difficulty, sessionAverage, scores, sessions, onStart, onViewChange }: { role: string; type: InterviewType; difficulty: Difficulty; sessionAverage: number; scores: Evaluation[]; sessions: SessionSummary[]; onStart: () => void; onViewChange: (view: View) => void }) { const latest = scores.length ? scores[scores.length - 1] : null; const score = sessionAverage || sessions[0]?.score || 0; const weakTopics = latest?.missing.length ? latest.missing : ["SQL joins", "Statistics", "Technical explanation"]; return <><header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[13px] text-ink/50">Practice summary</p><h1 className="font-display text-2xl font-semibold tracking-tight">Performance report</h1><p className="mt-1 text-[13px] text-ink/50">{scores.length ? `${role} · ${type} · ${difficulty}` : "Your completed practice sessions"}</p></div><Button type="button" onClick={onStart} className="rounded-xl bg-brand text-brand-foreground"><RotateCcw className="size-4" />Practice again</Button></header><div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"><section className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between"><p className="text-[15px] font-semibold">Overall performance</p><span className="rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-medium text-warning">Estimated · not a hiring decision</span></div><div className="mt-5 flex items-center gap-6"><ScoreRing score={score} size="large" /><div className="flex-1 space-y-3"><Metric label="Technical accuracy" score={latest?.technical ?? 81} color="brand" /><Metric label="Relevance" score={latest?.relevance ?? 84} color="brand" /><Metric label="Completeness" score={latest?.completeness ?? 72} color="teal" /><Metric label="Clarity" score={latest?.clarity ?? 80} color="teal" /><Metric label="Concept coverage" score={latest?.conceptCoverage ?? 76} color="teal" /></div></div></section><section className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between"><p className="text-[15px] font-semibold">Recommended learning areas</p><Target className="size-4 text-brand" /></div><p className="mt-2 text-[13px] leading-relaxed text-ink/55">Use these topics for your next practice round based on the concepts your answers missed.</p><div className="mt-4 space-y-2">{weakTopics.slice(0, 3).map((topic, index) => <div key={topic} className="glass-inset flex items-center gap-3 rounded-xl p-3"><span className="grid size-6 place-items-center rounded-full bg-brand/10 text-[11px] font-semibold text-brand">0{index + 1}</span><span className="text-[13px] font-medium">Practice {topic}</span></div>)}</div><Button type="button" variant="outline" onClick={onStart} className="mt-4 w-full rounded-xl border-white/70 bg-white/60">Practice weak topics <ArrowRight className="size-4" /></Button></section></div><section className="glass-panel mt-5 rounded-3xl p-5"><div className="flex items-center justify-between"><p className="text-[15px] font-semibold">Interview performance</p><button type="button" onClick={() => onViewChange("history")} className="focus-ring text-[12px] font-medium text-brand">View all history</button></div><div className="mt-5 flex h-36 items-end gap-3 border-b border-white/70 pb-1">{sessions.slice(0, 6).reverse().map((session, index) => <div key={session.id} className="flex min-w-0 flex-1 flex-col items-center gap-2"><span className="font-display text-sm font-semibold">{session.score}</span><div className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-brand to-teal" style={{ height: `${Math.max(22, session.score)}%` }} /><span className="max-w-full truncate text-[10px] text-ink/45">{session.role.split(" ")[0]}</span></div>)}</div></section></>;
}

function HistoryView({ sessions, onViewChange }: { sessions: SessionSummary[]; onViewChange: (view: View) => void }) { return <><header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[13px] text-ink/50">Your practice archive</p><h1 className="font-display text-2xl font-semibold tracking-tight">Interview history</h1><p className="mt-1 text-[13px] text-ink/50">Review estimated scores from completed demo sessions.</p></div><Button type="button" onClick={() => onViewChange("dashboard")} className="rounded-xl bg-brand text-brand-foreground"><Play className="size-4" />New interview</Button></header><section className="glass-panel rounded-3xl p-5"><div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.7fr_0.5fr] gap-4 border-b border-white/70 px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/40 md:grid"><span>Role</span><span>Format</span><span>Difficulty</span><span>Questions</span><span>Score</span></div><div className="space-y-2 pt-2">{sessions.map((session) => <div key={session.id} className="glass-inset grid gap-3 rounded-2xl p-4 md:grid-cols-[1.4fr_1fr_0.8fr_0.7fr_0.5fr] md:items-center md:gap-4"><div><p className="text-[13px] font-semibold">{session.role}</p><p className="mt-1 text-[11px] text-ink/45">{session.date}</p></div><span className="text-[12px] text-ink/60">{session.type}</span><span className="text-[12px] text-ink/60">{session.difficulty}</span><span className="text-[12px] text-ink/60">{session.questions} questions</span><span className="w-fit rounded-md bg-teal/12 px-2 py-1 text-[12px] font-semibold text-teal">{session.score}/100</span></div>)}</div></section></>; }

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-[12px] font-medium text-ink/55">{label}</span>{children}</label>; }
function Metric({ label, score, color }: { label: string; score: number; color: "brand" | "teal" }) { return <div><div className="flex justify-between text-[12px]"><span className="text-ink/60">{label}</span><span className="font-medium">{score}</span></div><div className="mt-1 h-1.5 rounded-full bg-ink/8"><div className={`h-full rounded-full ${color === "brand" ? "bg-brand" : "bg-teal"}`} style={{ width: `${score}%` }} /></div></div>; }
function ScoreRing({ score, size = "normal" }: { score: number; size?: "normal" | "large" }) { const radius = size === "large" ? 48 : 42; const circumference = 2 * Math.PI * radius; const offset = circumference - (Math.min(100, score) / 100) * circumference; return <div className={`relative grid shrink-0 place-items-center ${size === "large" ? "size-36" : "size-24"}`}><svg className="size-full -rotate-90" viewBox="0 0 120 120" fill="none" aria-label={`${score} out of 100`}><circle cx="60" cy="60" r={radius} stroke="currentColor" className="text-ink/10" strokeWidth="9" /><circle cx="60" cy="60" r={radius} stroke="currentColor" className="text-teal" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} /></svg><div className="absolute text-center"><p className={`${size === "large" ? "text-4xl" : "text-2xl"} font-display font-semibold`}>{score}</p><p className="text-[10px] uppercase tracking-[0.12em] text-ink/45">/ 100</p></div></div>; }

type SpeechRecognitionLike = { continuous: boolean; interimResults: boolean; onresult: (event: SpeechRecognitionEventLike) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void };
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<{ transcript: string }>> };