import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Clock, Flag, ChevronRight, ChevronLeft, SkipForward, Check, X, Loader2 } from "lucide-react";
import { fetchQuestionsByDiscipline, DISCIPLINE_MAP, type EnemQuestion } from "@/services/enemApi";

const YEARS = [2023, 2022, 2021, 2020, 2019];

type Phase = "setup" | "loading" | "exam" | "review" | "results";

export default function ModoVestibular({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedDiscipline, setSelectedDiscipline] = useState("matematica");
  const [selectedYear, setSelectedYear] = useState(2023);
  const [questions, setQuestions] = useState<EnemQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [seconds, setSeconds] = useState(90 * 60);
  const [running, setRunning] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = window.setInterval(() => setSeconds(s => s - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (seconds === 0 && phase === "exam") finishExam();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, seconds, phase]);

  const loadQuestions = async () => {
    setPhase("loading");
    try {
      const qs = await fetchQuestionsByDiscipline(selectedYear, selectedDiscipline, 10);
      if (qs.length === 0) {
        alert("Nenhuma questão encontrada. Tente outro ano ou disciplina.");
        setPhase("setup");
        return;
      }
      setQuestions(qs);
      setAnswers({});
      setFlagged(new Set());
      setCurrentQ(0);
      setSeconds(90 * 60);
      setPhase("exam");
      setRunning(true);
    } catch {
      alert("Erro ao carregar questões. Verifique sua conexão.");
      setPhase("setup");
    }
  };

  const finishExam = () => {
    setRunning(false);
    setPhase("results");
  };

  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");

  // Setup
  if (phase === "setup") {
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        <div className="container py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </div>
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
          <GraduationCap className="h-16 w-16 text-accent mb-4" />
          <h2 className="font-display font-800 text-2xl text-foreground mb-2">Modo Vestibular 🎓</h2>
          <p className="text-muted-foreground text-sm mb-6">Simulado com questões reais do ENEM • 90 min</p>

          <div className="w-full max-w-sm mb-4">
            <p className="text-xs text-muted-foreground mb-2 text-left">Disciplina:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DISCIPLINE_MAP).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDiscipline(key)}
                  className={`rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    selectedDiscipline === key
                      ? "bg-accent text-accent-foreground shadow-card"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm mb-6">
            <p className="text-xs text-muted-foreground mb-2 text-left">Ano:</p>
            <div className="flex gap-2 flex-wrap">
              {YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    selectedYear === y
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <Button variant="hero" size="lg" onClick={loadQuestions} className="rounded-full gap-2 px-10">
            <GraduationCap className="h-5 w-5" /> Iniciar Simulado
          </Button>
        </div>
      </section>
    );
  }

  // Loading
  if (phase === "loading") {
    return (
      <section className="min-h-[100dvh] flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-display">Carregando questões do ENEM...</p>
      </section>
    );
  }

  // Exam
  if (phase === "exam") {
    const q = questions[currentQ];
    const isFlagged = flagged.has(currentQ);
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        {/* Top bar */}
        <div className="container py-3 flex items-center justify-between border-b border-border">
          <span className="text-xs text-muted-foreground font-display">
            Questão {currentQ + 1}/{questions.length}
          </span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <span className={`font-display font-bold text-sm ${seconds < 300 ? "text-destructive animate-pulse-soft" : "text-foreground"}`}>
              {min}:{sec}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowReview(!showReview)} className="text-xs gap-1">
            <Flag className="h-3 w-3" /> Revisar
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-accent transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Review panel */}
        {showReview && (
          <div className="container py-3 bg-card border-b border-border animate-fade-in">
            <div className="flex flex-wrap gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentQ(i); setShowReview(false); }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    answers[i] ? "bg-primary text-primary-foreground" : flagged.has(i) ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"
                  } ${i === currentQ ? "ring-2 ring-ring" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question */}
        <div className="flex-1 container px-4 py-6 overflow-y-auto max-w-2xl">
          {q.context && (
            <div className="bg-muted/50 rounded-xl p-4 mb-4 text-sm text-foreground leading-relaxed max-h-48 overflow-y-auto">
              {q.context.replace(/!\[.*?\]\(.*?\)/g, "[imagem]").substring(0, 800)}
              {q.context.length > 800 && "..."}
            </div>
          )}
          <p className="font-display font-bold text-base text-foreground mb-4">
            {q.alternativesIntroduction}
          </p>
          <div className="flex flex-col gap-2">
            {q.alternatives.map(alt => (
              <button
                key={alt.letter}
                onClick={() => setAnswers({ ...answers, [currentQ]: alt.letter })}
                className={`flex items-start gap-3 rounded-xl p-4 text-left transition-all border-2 ${
                  answers[currentQ] === alt.letter
                    ? "border-primary bg-primary/10"
                    : "border-transparent bg-card hover:bg-muted/50"
                }`}
              >
                <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  answers[currentQ] === alt.letter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {alt.letter}
                </span>
                <span className="text-sm text-foreground">{alt.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="container py-4 flex items-center justify-between border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const nf = new Set(flagged);
              isFlagged ? nf.delete(currentQ) : nf.add(currentQ);
              setFlagged(nf);
            }}
            className={`gap-1 ${isFlagged ? "text-warning" : ""}`}
          >
            <Flag className="h-4 w-4" /> {isFlagged ? "Marcada" : "Marcar"}
          </Button>
          {currentQ < questions.length - 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setCurrentQ(currentQ + 1)} className="gap-1">
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="hero" size="sm" onClick={finishExam} className="gap-1 rounded-full">
              Finalizar <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </section>
    );
  }

  // Results
  const correct = questions.filter((q, i) => answers[i] === q.correctAlternative).length;
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Per-discipline stats
  const disciplineStats: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    const d = DISCIPLINE_MAP[q.discipline] || q.discipline;
    if (!disciplineStats[d]) disciplineStats[d] = { correct: 0, total: 0 };
    disciplineStats[d].total++;
    if (answers[i] === q.correctAlternative) disciplineStats[d].correct++;
  });

  return (
    <section className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
        <GraduationCap className="h-14 w-14 text-accent mb-4" />
        <h2 className="font-display font-900 text-3xl text-foreground mb-2">Resultado do Simulado</h2>
        <p className="text-muted-foreground text-sm mb-6">{DISCIPLINE_MAP[selectedDiscipline]} • ENEM {selectedYear}</p>

        <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-sm">
          <div className="bg-success/10 rounded-xl p-4">
            <Check className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="font-display font-bold text-2xl text-success">{correct}</p>
            <p className="text-xs text-muted-foreground">Acertos</p>
          </div>
          <div className="bg-destructive/10 rounded-xl p-4">
            <X className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="font-display font-bold text-2xl text-destructive">{answered - correct}</p>
            <p className="text-xs text-muted-foreground">Erros</p>
          </div>
          <div className="bg-primary/10 rounded-xl p-4">
            <p className="font-display font-bold text-2xl text-primary">{pct}%</p>
            <p className="text-xs text-muted-foreground">Aproveitamento</p>
          </div>
        </div>

        {/* Per discipline */}
        <div className="w-full max-w-sm mb-6">
          {Object.entries(disciplineStats).map(([d, s]) => (
            <div key={d} className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-foreground">{d}</span>
              <span className={`text-sm font-bold ${s.correct / s.total >= 0.6 ? "text-success" : "text-warning"}`}>
                {s.correct}/{s.total}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="hero" size="lg" onClick={() => setPhase("setup")} className="rounded-full gap-2">
            <GraduationCap className="h-5 w-5" /> Novo Simulado
          </Button>
          <Button variant="calm" size="lg" onClick={onBack} className="rounded-full">
            Voltar ao início
          </Button>
        </div>
      </div>
    </section>
  );
}
