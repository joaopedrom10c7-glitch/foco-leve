import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Coffee, ChevronRight } from "lucide-react";
import mascotImage from "@/assets/mascot-foco.png";

const subjects = [
  { emoji: "📐", label: "Matemática" },
  { emoji: "📝", label: "Português" },
  { emoji: "🔬", label: "Biologia" },
  { emoji: "⚡", label: "Física" },
  { emoji: "🧪", label: "Química" },
  { emoji: "🌍", label: "Geografia" },
  { emoji: "📜", label: "História" },
  { emoji: "📖", label: "Redação" },
];

const energyLevels = [
  { emoji: "😴", label: "Cansado", minutes: 15, desc: "Sessão leve de 15 min", color: "border-info/50 bg-info/10" },
  { emoji: "😐", label: "Normal", minutes: 25, desc: "Sessão focada de 25 min", color: "border-primary/50 bg-primary/10" },
  { emoji: "⚡", label: "Motivado", minutes: 45, desc: "Sessão intensa de 45 min", color: "border-accent/50 bg-accent/10" },
];

const psychMessages = [
  { at: 300, msg: "Faltam só 5 minutos! 💪" },
  { at: 180, msg: "Quase lá! Você é incrível! 🌟" },
  { at: 60, msg: "Último minuto! Termina forte! 🔥" },
];

const completionMessages = [
  "Você estudou mais que ontem! 🎉",
  "Sessão concluída! Você é demais! 🏆",
  "Parabéns! Cada minuto conta! ⭐",
];

// Mini curiosidades ENEM
const curiosities = [
  "💡 Sabia que a fotossíntese produz mais O₂ nos oceanos do que nas florestas?",
  "💡 O cérebro humano gasta 20% da energia do corpo, mesmo pesando só 2%!",
  "💡 O Brasil tem 6 biomas diferentes — tema frequente no ENEM!",
  "💡 A fórmula de Bhaskara foi criada na Índia, não na Grécia!",
  "💡 Dormir bem consolida a memória — estudar + dormir = nota alta!",
];

const motivationalQuotes = [
  "Disciplina é escolher entre o que você quer agora e o que você mais quer.",
  "Não importa quão devagar vá, desde que não pare.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
];

type Step = "subject" | "energy" | "studying" | "break" | "done";

export default function GuidedSession({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>("subject");
  const [subject, setSubject] = useState("");
  const [energy, setEnergy] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [psychMsg, setPsychMsg] = useState("");
  const [lofiPlaying, setLofiPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const totalSeconds = energy !== null ? energyLevels[energy].minutes * 60 : 0;

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = window.setInterval(() => setSeconds((s) => s - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (seconds === 0 && step === "studying") {
        setStep("done");
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, seconds, step]);

  // Psychological messages
  useEffect(() => {
    if (step !== "studying") return;
    const found = psychMessages.find((p) => seconds === p.at);
    if (found) setPsychMsg(found.msg);
  }, [seconds, step]);

  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");

  const startStudying = () => {
    setSeconds(totalSeconds);
    setRunning(true);
    setStep("studying");
    setPsychMsg("");
  };

  // Subject selection
  if (step === "subject") {
    return (
      <section className="min-h-[100dvh] flex flex-col">
        <div className="container py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </div>
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12">
          <img src={mascotImage} alt="Mascote" className="w-20 h-20 mb-4 animate-float" />
          <h2 className="font-display font-800 text-2xl md:text-3xl text-foreground mb-2 text-center">
            O que vamos estudar? 📚
          </h2>
          <p className="text-muted-foreground mb-8 text-center">Escolha uma matéria</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {subjects.map((s) => (
              <button
                key={s.label}
                onClick={() => { setSubject(s.label); setStep("energy"); }}
                className="bg-card rounded-2xl shadow-card p-5 text-center hover:shadow-elevated hover:-translate-y-1 transition-all duration-200 active:scale-95"
              >
                <span className="text-3xl block mb-2">{s.emoji}</span>
                <span className="font-display font-bold text-sm text-foreground">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Energy selection
  if (step === "energy") {
    return (
      <section className="min-h-[100dvh] flex flex-col">
        <div className="container py-4">
          <Button variant="ghost" size="sm" onClick={() => setStep("subject")} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </div>
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12">
          <img src={mascotImage} alt="Mascote" className="w-20 h-20 mb-4 animate-float" />
          <h2 className="font-display font-800 text-2xl md:text-3xl text-foreground mb-2 text-center">
            Como está sua energia? 🔋
          </h2>
          <p className="text-muted-foreground mb-8 text-center">Estudando <span className="font-semibold text-foreground">{subject}</span></p>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            {energyLevels.map((e, i) => (
              <button
                key={e.label}
                onClick={() => { setEnergy(i); startStudying(); }}
                className={`rounded-2xl border-2 p-6 text-center transition-all duration-200 hover:-translate-y-1 active:scale-95 ${e.color}`}
              >
                <span className="text-4xl block mb-2">{e.emoji}</span>
                <span className="font-display font-bold text-lg text-foreground block">{e.label}</span>
                <span className="text-sm text-muted-foreground">{e.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Studying
  if (step === "studying") {
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        <div className="container py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-display">{subject}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLofiPlaying(!lofiPlaying)}
            className="gap-1 text-xs"
          >
            {lofiPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {lofiPlaying ? "Som on" : "Som off"}
          </Button>
        </div>

        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12">
          {/* Progress circle */}
          <div className="relative w-56 h-56 md:w-72 md:h-72 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="112" fill="none" strokeWidth="10" className="stroke-muted" />
              <circle
                cx="128" cy="128" r="112" fill="none" strokeWidth="10"
                className="stroke-primary transition-all duration-1000"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 112}
                strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-5xl md:text-6xl text-foreground">{min}:{sec}</span>
              <span className="text-sm text-muted-foreground mt-1">
                {energy !== null ? energyLevels[energy].label : ""}
              </span>
            </div>
          </div>

          {/* Emotional progress bar */}
          <div className="w-full max-w-xs mb-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">{Math.round(progress)}% concluído</p>
          </div>

          {/* Psych message */}
          {psychMsg && (
            <div className="bg-primary/10 rounded-xl px-4 py-2 mb-4 animate-slide-up">
              <p className="text-sm font-display font-semibold text-primary text-center">{psychMsg}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="hero"
              size="lg"
              onClick={() => setRunning(!running)}
              className="rounded-full w-16 h-16"
            >
              {running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setRunning(false); setStep("break"); }}
            className="mt-6 gap-2 text-muted-foreground"
          >
            <Coffee className="h-4 w-4" /> Pausa inteligente
          </Button>
        </div>

        {/* Lofi audio */}
        {lofiPlaying && (
          <audio autoPlay loop>
            <source src="https://streams.fluxfm.de/Chillhop/mp3-128/streams.fluxfm.de/" type="audio/mpeg" />
          </audio>
        )}
      </section>
    );
  }

  // Break (entertainment)
  if (step === "break") {
    const curiosity = curiosities[Math.floor(Math.random() * curiosities.length)];
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    return (
      <section className="min-h-[100dvh] flex flex-col">
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
          <img src={mascotImage} alt="Mascote" className="w-20 h-20 mb-4 animate-float" />
          <h2 className="font-display font-800 text-2xl text-foreground mb-2">Pausa merecida! ☕</h2>
          <p className="text-muted-foreground text-sm mb-6">Dopamina controlada — sem TikTok!</p>

          <div className="bg-card rounded-2xl shadow-card p-5 w-full max-w-sm mb-4">
            <p className="text-sm text-foreground">{curiosity}</p>
          </div>

          <div className="bg-primary/5 rounded-2xl p-5 w-full max-w-sm mb-6 border border-primary/20">
            <p className="text-sm text-muted-foreground italic">"{quote}"</p>
          </div>

          <Button
            variant="hero"
            size="lg"
            onClick={() => { setRunning(true); setStep("studying"); }}
            className="rounded-full gap-2"
          >
            <Play className="h-5 w-5" /> Voltar a estudar
          </Button>
        </div>
      </section>
    );
  }

  // Done
  const doneMsg = completionMessages[Math.floor(Math.random() * completionMessages.length)];
  return (
    <section className="min-h-[100dvh] flex flex-col">
      <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="font-display font-900 text-3xl text-foreground mb-3">Sessão completa!</h2>
        <p className="text-muted-foreground mb-2">{doneMsg}</p>
        <p className="text-sm text-primary font-semibold mb-8">
          +{energy !== null ? energyLevels[energy].minutes * 2 : 0} XP ganhos!
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="hero" size="lg" onClick={() => { setStep("subject"); setEnergy(null); }} className="rounded-full gap-2">
            <Sparkles className="h-5 w-5" /> Nova sessão
          </Button>
          <Button variant="calm" size="lg" onClick={onBack} className="rounded-full">
            Voltar ao início
          </Button>
        </div>
      </div>
    </section>
  );
}
