import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, StopCircle, Brain, Music, Lightbulb, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import mascotImage from "@/assets/mascot-foco.png";

const curiosities = [
  "💡 A fotossíntese produz mais O₂ nos oceanos do que nas florestas!",
  "💡 O cérebro gasta 20% da energia do corpo, mesmo pesando só 2%!",
  "💡 O Brasil tem 6 biomas diferentes — tema frequente no ENEM!",
  "💡 A fórmula de Bhaskara foi criada na Índia, não na Grécia!",
  "💡 Dormir bem consolida a memória — estudar + dormir = nota alta!",
  "💡 O ENEM tem 180 questões + redação em 2 dias!",
  "💡 O Iluminismo surgiu no séc. XVIII e mudou o mundo ocidental!",
  "💡 Mitocôndrias são as 'usinas de energia' das células!",
  "💡 O Brasil é o 5º maior país do mundo em área territorial!",
  "💡 Machado de Assis é considerado o maior escritor brasileiro!",
];

const quotes = [
  "Disciplina é escolher entre o que você quer agora e o que você mais quer.",
  "Não importa quão devagar vá, desde que não pare. — Confúcio",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Você não precisa ser perfeito. Precisa ser consistente.",
  "A jornada de mil quilômetros começa com um único passo. — Lao Tzu",
  "Acredite: você é mais capaz do que imagina.",
  "Cada questão que você estuda é um passo mais perto da aprovação.",
];

const quizzes = [
  {
    question: "Qual é a capital do estado de Minas Gerais?",
    options: ["São Paulo", "Belo Horizonte", "Curitiba", "Salvador"],
    correct: 1,
  },
  {
    question: "Em que ano foi proclamada a República no Brasil?",
    options: ["1822", "1889", "1930", "1964"],
    correct: 1,
  },
  {
    question: "Qual organela é responsável pela respiração celular?",
    options: ["Ribossomo", "Mitocôndria", "Lisossomo", "Complexo de Golgi"],
    correct: 1,
  },
  {
    question: "Quem escreveu 'Dom Casmurro'?",
    options: ["José de Alencar", "Machado de Assis", "Clarice Lispector", "Jorge Amado"],
    correct: 1,
  },
  {
    question: "Qual é a fórmula da velocidade média?",
    options: ["v = d/t", "v = d×t", "v = t/d", "v = d²/t"],
    correct: 0,
  },
  {
    question: "Qual bioma brasileiro é o maior em extensão?",
    options: ["Cerrado", "Caatinga", "Amazônia", "Mata Atlântica"],
    correct: 2,
  },
];

const memes = [
  "📐 Eu: 'Essa questão é fácil' — A questão: 💀",
  "🧠 Estudante antes do ENEM: 'Eu sei tudo'\n🧠 Estudante no ENEM: 'O que é ler?'",
  "📚 Plot twist: a matéria que você pulou caiu na prova",
  "☕ Café + madrugada + resumo = aluno brasileiro em novembro",
  "🎯 Nota de corte: 750 | Sua nota: 749.99 | Você: 🥲",
];

type Tab = "curiosidade" | "quiz" | "motivacao" | "meme";

interface Props {
  subject: string;
  onResume: () => void;
  onEnd: () => void;
}

export default function BreakScreen({ subject, onResume, onEnd }: Props) {
  const [tab, setTab] = useState<Tab>("curiosidade");
  const [breakTimer, setBreakTimer] = useState(300); // 5 min break
  const [quizIndex] = useState(() => Math.floor(Math.random() * quizzes.length));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [curiosityIndex, setCuriosityIndex] = useState(() => Math.floor(Math.random() * curiosities.length));

  useEffect(() => {
    const id = setInterval(() => setBreakTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const bMin = Math.floor(breakTimer / 60).toString().padStart(2, "0");
  const bSec = (breakTimer % 60).toString().padStart(2, "0");
  const quiz = quizzes[quizIndex];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "curiosidade", label: "Curiosidade", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "quiz", label: "Quiz", icon: <Brain className="h-4 w-4" /> },
    { id: "motivacao", label: "Frase", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "meme", label: "Meme", icon: <Music className="h-4 w-4" /> },
  ];

  return (
    <section className="min-h-[100dvh] flex flex-col bg-background">
      <div className="container py-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Intervalo · {subject}</span>
        <span className="text-sm font-display font-bold text-primary">{bMin}:{bSec}</span>
      </div>

      <div className="flex-1 container flex flex-col items-center px-6 pb-12">
        <motion.img
          src={mascotImage} alt="Mascote"
          className="w-16 h-16 mb-3"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        />
        <h2 className="font-display font-extrabold text-xl text-foreground mb-1">Pausa merecida! ☕</h2>
        <p className="text-muted-foreground text-xs mb-5">Dopamina controlada — sem TikTok!</p>

        {/* Tab selector */}
        <div className="flex gap-1 mb-5 bg-muted/50 rounded-full p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="w-full max-w-sm flex-1">
          <AnimatePresence mode="wait">
            {tab === "curiosidade" && (
              <motion.div key="cur" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl shadow-card p-5"
              >
                <p className="text-sm text-foreground leading-relaxed">{curiosities[curiosityIndex]}</p>
                <Button variant="ghost" size="sm" className="mt-3 text-xs"
                  onClick={() => setCuriosityIndex((i) => (i + 1) % curiosities.length)}
                >
                  Próxima →
                </Button>
              </motion.div>
            )}

            {tab === "quiz" && (
              <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl shadow-card p-5"
              >
                <p className="text-sm font-semibold text-foreground mb-4">{quiz.question}</p>
                <div className="space-y-2">
                  {quiz.options.map((opt, i) => {
                    let bg = "bg-muted/50 hover:bg-muted";
                    if (selectedAnswer !== null) {
                      if (i === quiz.correct) bg = "bg-green-500/20 border-green-500/50";
                      else if (i === selectedAnswer) bg = "bg-red-500/20 border-red-500/50";
                    }
                    return (
                      <button
                        key={i}
                        disabled={selectedAnswer !== null}
                        onClick={() => setSelectedAnswer(i)}
                        className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${bg}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedAnswer !== null && (
                  <p className={`text-xs mt-3 font-semibold ${selectedAnswer === quiz.correct ? "text-green-500" : "text-red-500"}`}>
                    {selectedAnswer === quiz.correct ? "Acertou! 🎉" : `Resposta: ${quiz.options[quiz.correct]}`}
                  </p>
                )}
              </motion.div>
            )}

            {tab === "motivacao" && (
              <motion.div key="mot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-primary/5 rounded-2xl p-6 border border-primary/20"
              >
                <p className="text-sm text-foreground italic leading-relaxed">
                  "{quotes[Math.floor(Math.random() * quotes.length)]}"
                </p>
              </motion.div>
            )}

            {tab === "meme" && (
              <motion.div key="meme" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-2xl shadow-card p-5"
              >
                <p className="text-sm text-foreground whitespace-pre-line">{memes[Math.floor(Math.random() * memes.length)]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
          <Button variant="hero" size="lg" onClick={onResume} className="rounded-full gap-2">
            <Play className="h-5 w-5" /> Voltar a estudar
          </Button>
          <Button variant="ghost" size="sm" onClick={onEnd} className="gap-2 text-muted-foreground">
            <StopCircle className="h-4 w-4" /> Encerrar sessão
          </Button>
        </div>
      </div>
    </section>
  );
}
