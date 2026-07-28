import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, Loader2, Timer, RefreshCw, ChevronRight } from "lucide-react";
import { fetchQuestionsByDiscipline, DISCIPLINE_MAP, type EnemQuestion } from "@/services/enemApi";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "pomodoro" | "revisao";

interface Props {
  mode: Mode;
  onBack: () => void;
}

const MODE_CONFIG = {
  pomodoro: {
    title: "Pomodoro 🍅",
    desc: "25 min de foco + 5 min de pausa",
    icon: Timer,
    color: "text-primary",
  },
  revisao: {
    title: "Revisão Ativa 🧠",
    desc: "Questões dos seus erros + novas",
    icon: RefreshCw,
    color: "text-accent",
  },
};

export default function StudyModeSession({ mode, onBack }: Props) {
  const cfg = MODE_CONFIG[mode];
  if (mode === "pomodoro") return <PomodoroMode onBack={onBack} cfg={cfg as typeof MODE_CONFIG.pomodoro} />;
  return <RevisaoMode onBack={onBack} cfg={cfg as typeof MODE_CONFIG.revisao} />;
}

/* ───────── POMODORO ───────── */
function PomodoroMode({ onBack, cfg }: { onBack: () => void; cfg: typeof MODE_CONFIG.pomodoro }) {
  const FOCUS = 25 * 60;
  const BREAK = 5 * 60;
  const { user } = useAuth();
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [seconds, setSeconds] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);

  // Tick — only depends on `running`, so the countdown never gets stuck
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Phase transition when the countdown reaches zero
  useEffect(() => {
    if (!running || seconds > 0) return;
    if (phase === "focus") {
      setCycles(c => c + 1);
      if (user) {
        supabase.from("study_sessions").insert({
          user_id: user.id, materia: "Pomodoro", area: "Foco", modo: "pomodoro", duracao_min: 25,
        });
        supabase.from("focus_sessions").insert({
          user_id: user.id, materia: "Pomodoro", duracao: 25, completado: true,
        });
      }
      setPhase("break");
      setSeconds(BREAK);
    } else {
      setPhase("focus");
      setSeconds(FOCUS);
    }
  }, [running, seconds, phase, user, FOCUS, BREAK]);


  const total = phase === "focus" ? FOCUS : BREAK;
  const progress = ((total - seconds) / total) * 100;
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");

  return (
    <section className="min-h-[100dvh] flex flex-col bg-background">
      <div className="container py-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ArrowLeft className="h-4 w-4" /> Voltar</Button>
      </div>
      <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12">
        <Timer className={`h-10 w-10 mb-2 ${cfg.color}`} />
        <h2 className="font-display font-bold text-2xl mb-1">{cfg.title}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {phase === "focus" ? "Hora de focar 🎯" : "Pausa merecida ☕"} · Ciclo {cycles + 1}
        </p>

        <div className="relative w-56 h-56 md:w-72 md:h-72 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="112" fill="none" strokeWidth="10" className="stroke-muted" />
            <circle
              cx="128" cy="128" r="112" fill="none" strokeWidth="10"
              className={`${phase === "focus" ? "stroke-primary" : "stroke-success"} transition-all duration-1000`}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 112}
              strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-5xl md:text-6xl">{min}:{sec}</span>
            <span className="text-sm text-muted-foreground mt-1">{phase === "focus" ? "Foco" : "Pausa"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="hero" size="lg" onClick={() => setRunning(!running)} className="rounded-full w-16 h-16">
            {running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setRunning(false); setPhase("focus"); setSeconds(FOCUS); setCycles(0); }}>
            Reiniciar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">{cycles} ciclos completos hoje</p>
      </div>
    </section>
  );
}


/* ───────── REVISÃO ATIVA ───────── */
function RevisaoMode({ onBack, cfg }: { onBack: () => void; cfg: typeof MODE_CONFIG.revisao }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<"loading" | "playing" | "done">("loading");
  const [questions, setQuestions] = useState<EnemQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [weakDiscipline, setWeakDiscipline] = useState<string>("");

  useEffect(() => {
    (async () => {
      // Identify weak discipline from user_answers
      let weakKey = "matematica";
      let weakLabel = "Matemática";
      if (user) {
        const { data } = await supabase
          .from("user_answers")
          .select("materia, correto")
          .eq("user_id", user.id)
          .eq("correto", false)
          .order("created_at", { ascending: false })
          .limit(50);
        if (data && data.length > 0) {
          const counts: Record<string, number> = {};
          data.forEach(r => { counts[r.materia] = (counts[r.materia] || 0) + 1; });
          const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          weakLabel = top[0];
          const found = Object.entries(DISCIPLINE_MAP).find(([, v]) => v === top[0]);
          if (found) weakKey = found[0];
        }
      }
      setWeakDiscipline(weakLabel);

      try {
        // 5 questions from weak discipline (revisão dos erros) + 5 random new
        const weakQ = await fetchQuestionsByDiscipline(2023, weakKey, 5).catch(() => []);
        const newQ = await fetchQuestionsByDiscipline(2022, weakKey, 5).catch(() => []);
        const all = [...weakQ, ...newQ];
        if (all.length === 0) {
          alert("Erro ao carregar questões para revisão.");
          onBack();
          return;
        }
        setQuestions(all);
        setPhase("playing");
      } catch {
        alert("Erro ao carregar questões.");
        onBack();
      }
    })();
  }, [user, onBack]);

  const submitAnswer = (letter: string) => {
    setAnswers({ ...answers, [currentQ]: letter });
    setShowResult(true);
    if (user) {
      const q = questions[currentQ];
      supabase.from("user_answers").insert({
        user_id: user.id,
        materia: DISCIPLINE_MAP[q.discipline] || q.discipline,
        assunto: "revisao_ativa",
        correto: letter === q.correctAlternative,
        tempo_resposta: 0,
      });
    }
  };

  const next = () => {
    setShowResult(false);
    if (currentQ >= questions.length - 1) {
      if (user) {
        supabase.from("study_sessions").insert({
          user_id: user.id, materia: "Revisão Ativa", area: weakDiscipline, modo: "revisao", duracao_min: 20,
        });
      }
      setPhase("done");
    } else {
      setCurrentQ(c => c + 1);
    }
  };

  if (phase === "loading") {
    return (
      <section className="min-h-[100dvh] flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground">Buscando questões para revisar seus erros...</p>
      </section>
    );
  }

  if (phase === "done") {
    const correct = questions.filter((q, i) => answers[i] === q.correctAlternative).length;
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
          <RefreshCw className="h-14 w-14 text-accent mb-4" />
          <h2 className="font-display font-bold text-3xl mb-2">Revisão completa!</h2>
          <p className="text-muted-foreground mb-6">Foco: {weakDiscipline}</p>
          <div className="bg-accent/10 rounded-2xl p-6 mb-6">
            <p className="font-display font-bold text-5xl text-accent">{correct}/{questions.length}</p>
            <p className="text-sm text-muted-foreground">acertos</p>
          </div>
          <Button variant="hero" size="lg" onClick={onBack} className="rounded-full">Voltar</Button>
        </div>
      </section>
    );
  }

  const q = questions[currentQ];
  const isCorrect = answers[currentQ] === q.correctAlternative;

  return (
    <section className="min-h-[100dvh] flex flex-col bg-background">
      <div className="container py-3 flex items-center justify-between border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <span className="text-xs text-muted-foreground font-display">
          Revisão {currentQ + 1}/{questions.length} · {weakDiscipline}
        </span>
        <span className="w-8" />
      </div>

      <div className="flex-1 container px-4 py-6 overflow-y-auto max-w-2xl">
        {q.context && (
          <div className="bg-muted/50 rounded-xl p-4 mb-4 text-sm leading-relaxed max-h-40 overflow-y-auto">
            {q.context.replace(/!\[.*?\]\(.*?\)/g, "[imagem]").substring(0, 600)}
          </div>
        )}
        <p className="font-display font-bold text-base mb-4">{q.alternativesIntroduction}</p>
        <div className="flex flex-col gap-2">
          {q.alternatives.map(alt => {
            const selected = answers[currentQ] === alt.letter;
            const correct = alt.letter === q.correctAlternative;
            const wrongPick = showResult && selected && !correct;
            const showCorrect = showResult && correct;
            return (
              <button
                key={alt.letter}
                disabled={showResult}
                onClick={() => submitAnswer(alt.letter)}
                className={`flex items-start gap-3 rounded-xl p-3 text-left transition-all border-2 ${
                  showCorrect ? "border-success bg-success/10" :
                  wrongPick ? "border-destructive bg-destructive/10" :
                  selected ? "border-primary bg-primary/10" :
                  "border-transparent bg-card hover:bg-muted/50"
                }`}
              >
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  showCorrect ? "bg-success text-success-foreground" :
                  wrongPick ? "bg-destructive text-destructive-foreground" :
                  selected ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>{alt.letter}</span>
                <span className="text-sm">{alt.text}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-xl p-4 ${isCorrect ? "bg-success/10" : "bg-destructive/10"}`}
            >
              <p className={`font-bold text-sm ${isCorrect ? "text-success" : "text-destructive"}`}>
                {isCorrect ? "✓ Correto!" : `✗ Resposta correta: ${q.correctAlternative}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showResult && (
        <div className="container py-4 border-t border-border">
          <Button variant="hero" className="w-full rounded-full gap-2" onClick={next}>
            {currentQ === questions.length - 1 ? "Finalizar" : "Próxima"} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
