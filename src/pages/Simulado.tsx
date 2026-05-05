import { useState, useEffect, useCallback } from "react";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, BarChart3, Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";

// ENEM-style questions bank
const questionsBank = [
  // Ciências da Natureza
  {
    id: 1, area: "Ciências da Natureza", materia: "Biologia",
    text: "A fotossíntese é um processo fundamental para a vida na Terra. Qual é a equação geral simplificada da fotossíntese?",
    options: [
      "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
      "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O",
      "6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O",
      "6O₂ + C₆H₁₂O₆ → 6CO₂ + 12H₂O",
    ],
    correct: 0,
    explanation: "A fotossíntese utiliza gás carbônico e água, na presença de luz, para produzir glicose e oxigênio.",
  },
  {
    id: 2, area: "Ciências da Natureza", materia: "Física",
    text: "Um corpo é lançado verticalmente para cima com velocidade inicial de 20 m/s. Considerando g = 10 m/s², qual a altura máxima atingida?",
    options: ["10 m", "20 m", "30 m", "40 m"],
    correct: 1,
    explanation: "Usando v² = v₀² - 2gh, com v=0: 0 = 400 - 20h → h = 20m.",
  },
  {
    id: 3, area: "Ciências da Natureza", materia: "Química",
    text: "Qual das alternativas representa uma reação de neutralização?",
    options: [
      "HCl + NaOH → NaCl + H₂O",
      "2H₂ + O₂ → 2H₂O",
      "Fe + CuSO₄ → FeSO₄ + Cu",
      "CaCO₃ → CaO + CO₂",
    ],
    correct: 0,
    explanation: "Neutralização ocorre entre ácido (HCl) e base (NaOH), formando sal e água.",
  },
  // Matemática
  {
    id: 4, area: "Matemática", materia: "Matemática",
    text: "Uma progressão aritmética tem primeiro termo a₁ = 3 e razão r = 5. Qual é o 20º termo?",
    options: ["98", "100", "103", "95"],
    correct: 0,
    explanation: "a₂₀ = a₁ + (n-1)r = 3 + 19×5 = 3 + 95 = 98.",
  },
  {
    id: 5, area: "Matemática", materia: "Matemática",
    text: "Em uma pesquisa com 200 pessoas, 120 gostam de futebol e 80 gostam de vôlei. Se 40 gostam de ambos, quantas não gostam de nenhum dos dois?",
    options: ["40", "60", "30", "20"],
    correct: 0,
    explanation: "Pelo princípio da inclusão-exclusão: 120+80-40 = 160 gostam de pelo menos um. 200-160 = 40.",
  },
  // Linguagens
  {
    id: 6, area: "Linguagens", materia: "Português",
    text: "Em 'O menino que estava cansado dormiu cedo', a oração subordinada é classificada como:",
    options: [
      "Adjetiva restritiva",
      "Adjetiva explicativa",
      "Substantiva subjetiva",
      "Adverbial causal",
    ],
    correct: 0,
    explanation: "A oração 'que estava cansado' restringe o sentido de 'menino', sendo adjetiva restritiva.",
  },
  {
    id: 7, area: "Linguagens", materia: "Português",
    text: "Qual figura de linguagem está presente em: 'Aquele aluno é um gênio'?",
    options: ["Metáfora", "Metonímia", "Hipérbole", "Ironia"],
    correct: 0,
    explanation: "Metáfora: comparação implícita entre o aluno e um gênio.",
  },
  // Ciências Humanas
  {
    id: 8, area: "Ciências Humanas", materia: "História",
    text: "A Revolução Industrial, iniciada na Inglaterra no século XVIII, teve como principal consequência:",
    options: [
      "A substituição do trabalho manual pela máquina",
      "O fortalecimento do sistema feudal",
      "A diminuição da urbanização",
      "O fim do comércio internacional",
    ],
    correct: 0,
    explanation: "A mecanização substituiu o trabalho manual, transformando a economia e a sociedade.",
  },
  {
    id: 9, area: "Ciências Humanas", materia: "Geografia",
    text: "O fenômeno da inversão térmica agrava a poluição atmosférica porque:",
    options: [
      "Impede a dispersão dos poluentes na atmosfera",
      "Aumenta a temperatura dos oceanos",
      "Provoca chuvas ácidas imediatamente",
      "Reduz a umidade relativa do ar",
    ],
    correct: 0,
    explanation: "A inversão térmica forma uma camada de ar quente sobre ar frio, impedindo a dispersão dos poluentes.",
  },
  {
    id: 10, area: "Ciências Humanas", materia: "História",
    text: "A abolição da escravatura no Brasil ocorreu em:",
    options: ["1822", "1850", "1888", "1891"],
    correct: 2,
    explanation: "A Lei Áurea foi assinada em 13 de maio de 1888 pela Princesa Isabel.",
  },
];

type Phase = "config" | "question" | "result";

export default function SimuladoPage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [phase, setPhase] = useState<Phase>("config");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<typeof questionsBank>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  // Timer
  useEffect(() => {
    if (phase !== "question") return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const areas = ["Todas", "Ciências da Natureza", "Matemática", "Linguagens", "Ciências Humanas"];

  const startSimulado = () => {
    let pool = questionsBank;
    if (selectedArea && selectedArea !== "Todas") {
      pool = questionsBank.filter((q) => q.area === selectedArea);
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, questionCount);
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimer(0);
    setStartTime(Date.now());
    setPhase("question");
  };

  const confirmAnswer = () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishSimulado();
    }
  };

  const finishSimulado = useCallback(async () => {
    setPhase("result");
    if (!user) return;

    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const totalTime = Math.round((Date.now() - startTime) / 1000);

    // Save each answer
    for (let i = 0; i < questions.length; i++) {
      await supabase.from("user_answers").insert({
        user_id: user.id,
        materia: questions[i].materia,
        assunto: questions[i].area,
        correto: answers[i] === questions[i].correct,
        tempo_resposta: Math.round(totalTime / questions.length),
      });
    }

    // Award XP
    const xpGained = correct * 20 + questions.length * 5;
    const { data: profile } = await supabase
      .from("profiles").select("xp_total, level").eq("id", user.id).single();
    if (profile) {
      const newXp = (profile.xp_total || 0) + xpGained;
      await supabase.from("profiles").update({
        xp_total: newXp,
        level: Math.floor(newXp / 500) + 1,
      }).eq("id", user.id);
    }

    await supabase.from("analytics_events").insert({
      user_id: user.id,
      evento: "simulado_completed",
      metadata: { area: selectedArea, correct, total: questions.length, time: totalTime },
    });

    toast({ title: `+${xpGained} XP! 🎯`, description: `${correct}/${questions.length} acertos no simulado!` });
  }, [user, questions, answers, startTime, selectedArea]);

  const timerMin = Math.floor(timer / 60).toString().padStart(2, "0");
  const timerSec = (timer % 60).toString().padStart(2, "0");

  if (!user) {
    return (
      <>
        <AppNav />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Faça login para acessar os simulados.</p>
          <Button variant="hero" onClick={() => setShowAuth(true)}>Entrar</Button>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </>
    );
  }

  // Config
  if (phase === "config") {
    return (
      <>
        <AppNav />
        <div className="min-h-screen bg-background pb-24">
          <div className="container py-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <h1 className="font-display font-extrabold text-3xl mb-2">Simulado ENEM 🎯</h1>
              <p className="text-muted-foreground">Pratique com questões no estilo ENEM</p>
            </motion.div>

            <div className="max-w-md mx-auto space-y-6">
              {/* Area selection */}
              <div>
                <p className="font-display font-bold text-sm mb-3">Área do conhecimento</p>
                <div className="grid grid-cols-2 gap-2">
                  {areas.map((a) => (
                    <button
                      key={a}
                      onClick={() => setSelectedArea(a)}
                      className={`p-3 rounded-xl text-sm font-medium transition-colors border ${
                        selectedArea === a
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/20"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div>
                <p className="font-display font-bold text-sm mb-3">Quantidade de questões</p>
                <div className="flex gap-2">
                  {[5, 10, 15].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`flex-1 p-3 rounded-xl text-sm font-bold transition-colors border ${
                        questionCount === n
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-card border-border text-muted-foreground"
                      }`}
                    >
                      {n} questões
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full rounded-xl h-14 text-lg"
                onClick={startSimulado}
                disabled={!selectedArea}
              >
                Começar Simulado 🚀
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Question
  if (phase === "question") {
    const q = questions[currentIndex];
    return (
      <>
        <div className="min-h-screen bg-background pb-24">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
            <div className="container flex items-center justify-between h-12">
              <span className="text-xs text-muted-foreground">{currentIndex + 1}/{questions.length} · {q.area}</span>
              <span className="text-xs font-display font-bold text-primary flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timerMin}:{timerSec}
              </span>
            </div>
            {/* Progress */}
            <div className="h-1 bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="container py-6 max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <p className="text-sm text-foreground leading-relaxed mb-6">{q.text}</p>

                <div className="space-y-3 mb-6">
                  {q.options.map((opt, i) => {
                    let classes = "bg-card border-border hover:border-primary/30";
                    if (showExplanation) {
                      if (i === q.correct) classes = "bg-green-500/10 border-green-500/50";
                      else if (i === selectedAnswer) classes = "bg-red-500/10 border-red-500/50";
                    } else if (i === selectedAnswer) {
                      classes = "bg-primary/10 border-primary/50";
                    }
                    return (
                      <button
                        key={i}
                        disabled={showExplanation}
                        onClick={() => setSelectedAnswer(i)}
                        className={`w-full text-left p-4 rounded-xl border text-sm transition-all ${classes}`}
                      >
                        <span className="font-bold text-muted-foreground mr-2">
                          {String.fromCharCode(65 + i)})
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6"
                  >
                    <p className="text-xs text-muted-foreground mb-1 font-semibold">Explicação:</p>
                    <p className="text-sm text-foreground">{q.explanation}</p>
                  </motion.div>
                )}

                {!showExplanation ? (
                  <Button
                    variant="hero" className="w-full rounded-xl h-12"
                    disabled={selectedAnswer === null}
                    onClick={confirmAnswer}
                  >
                    Confirmar resposta
                  </Button>
                ) : (
                  <Button variant="hero" className="w-full rounded-xl h-12" onClick={nextQuestion}>
                    {currentIndex < questions.length - 1 ? "Próxima questão →" : "Ver resultado 🏆"}
                  </Button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </>
    );
  }

  // Result
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  const percentage = Math.round((correct / questions.length) * 100);
  const totalTime = timer;
  const avgTime = Math.round(totalTime / questions.length);

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-24">
        <div className="container py-10 max-w-md">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-6xl mb-4"
            >
              {percentage >= 70 ? "🏆" : percentage >= 50 ? "👏" : "💪"}
            </motion.div>
            <h2 className="font-display font-extrabold text-3xl mb-2">Resultado</h2>

            {/* Score circle */}
            <div className="relative w-40 h-40 mx-auto my-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" strokeWidth="8" className="stroke-muted" />
                <circle
                  cx="64" cy="64" r="56" fill="none" strokeWidth="8"
                  className={percentage >= 70 ? "stroke-green-500" : percentage >= 50 ? "stroke-yellow-500" : "stroke-red-500"}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - percentage / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-extrabold text-3xl">{percentage}%</span>
                <span className="text-xs text-muted-foreground">{correct}/{questions.length}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card rounded-xl p-3 shadow-card text-center">
                <CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-1" />
                <p className="font-bold text-lg">{correct}</p>
                <p className="text-[10px] text-muted-foreground">Acertos</p>
              </div>
              <div className="bg-card rounded-xl p-3 shadow-card text-center">
                <XCircle className="h-5 w-5 mx-auto text-red-500 mb-1" />
                <p className="font-bold text-lg">{questions.length - correct}</p>
                <p className="text-[10px] text-muted-foreground">Erros</p>
              </div>
              <div className="bg-card rounded-xl p-3 shadow-card text-center">
                <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="font-bold text-lg">{avgTime}s</p>
                <p className="text-[10px] text-muted-foreground">Média/questão</p>
              </div>
            </div>

            {/* By area */}
            <div className="bg-card rounded-xl p-4 shadow-card mb-6 text-left">
              <p className="font-display font-bold text-sm mb-3">Desempenho por área</p>
              {[...new Set(questions.map((q) => q.area))].map((area) => {
                const areaQ = questions.filter((q) => q.area === area);
                const areaCorrect = areaQ.filter((q, idx) => {
                  const realIdx = questions.indexOf(q);
                  return answers[realIdx] === q.correct;
                }).length;
                const pct = Math.round((areaCorrect / areaQ.length) * 100);
                return (
                  <div key={area} className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{area}</span>
                      <span className="font-bold">{areaCorrect}/{areaQ.length}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" onClick={() => setPhase("config")} className="rounded-xl gap-2">
                <Brain className="h-5 w-5" /> Novo simulado
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
