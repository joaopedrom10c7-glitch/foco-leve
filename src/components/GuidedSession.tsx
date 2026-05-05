import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Sparkles, Coffee, Brain, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import mascotImage from "@/assets/mascot-foco.png";
import BreakScreen from "./BreakScreen";

const subjects = [
  { emoji: "📐", label: "Matemática", area: "Matemática" },
  { emoji: "📝", label: "Português", area: "Linguagens" },
  { emoji: "🔬", label: "Biologia", area: "Ciências da Natureza" },
  { emoji: "⚡", label: "Física", area: "Ciências da Natureza" },
  { emoji: "🧪", label: "Química", area: "Ciências da Natureza" },
  { emoji: "🌍", label: "Geografia", area: "Ciências Humanas" },
  { emoji: "📜", label: "História", area: "Ciências Humanas" },
  { emoji: "📖", label: "Redação", area: "Redação" },
];

const energyLevels = [
  { emoji: "😴", label: "Cansado", minutes: 15, desc: "Sessão leve", color: "border-info/50 bg-info/10", xpMultiplier: 1 },
  { emoji: "😐", label: "Normal", minutes: 25, desc: "Sessão focada", color: "border-primary/50 bg-primary/10", xpMultiplier: 1.5 },
  { emoji: "⚡", label: "Motivado", minutes: 45, desc: "Sessão intensa", color: "border-accent/50 bg-accent/10", xpMultiplier: 2 },
];

const psychMessages = [
  { at: 300, msg: "Faltam só 5 minutos! 💪" },
  { at: 180, msg: "Quase lá! Você é incrível! 🌟" },
  { at: 60, msg: "Último minuto! Termina forte! 🔥" },
  { at: 600, msg: "Metade da sessão! Segura firme! 🎯" },
];

type Step = "subject" | "energy" | "studying" | "break" | "done";

export default function GuidedSession({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("subject");
  const [subject, setSubject] = useState("");
  const [area, setArea] = useState("");
  const [energy, setEnergy] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [psychMsg, setPsychMsg] = useState("");
  const [lofiPlaying, setLofiPlaying] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const totalSeconds = energy !== null ? energyLevels[energy].minutes * 60 : 0;

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = window.setInterval(() => setSeconds((s) => s - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (seconds === 0 && step === "studying" && !sessionSaved) {
        completeSession();
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, seconds, step]);

  useEffect(() => {
    if (step !== "studying") return;
    const found = psychMessages.find((p) => seconds === p.at);
    if (found) setPsychMsg(found.msg);
  }, [seconds, step]);

  const completeSession = useCallback(async () => {
    if (sessionSaved || !user || energy === null) {
      setStep("done");
      return;
    }
    setSessionSaved(true);
    const minutesStudied = energyLevels[energy].minutes;
    const xpGained = Math.round(minutesStudied * energyLevels[energy].xpMultiplier);
    setEarnedXp(xpGained);

    // Save study session
    await supabase.from("study_sessions").insert({
      user_id: user.id,
      materia: subject,
      area,
      modo: "guiado",
      duracao_min: minutesStudied,
    });

    // Save focus session
    await supabase.from("focus_sessions").insert({
      user_id: user.id,
      materia: subject,
      duracao: minutesStudied,
      completado: true,
    });

    // Update XP and level
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp_total, level, streak_dias, ultimo_estudo")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newXp = (profile.xp_total || 0) + xpGained;
      const newLevel = Math.floor(newXp / 500) + 1;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const lastStudy = profile.ultimo_estudo;
      let newStreak = profile.streak_dias || 0;
      if (lastStudy === yesterday) newStreak += 1;
      else if (lastStudy !== today) newStreak = 1;

      await supabase.from("profiles").update({
        xp_total: newXp,
        level: newLevel,
        streak_dias: newStreak,
        ultimo_estudo: today,
      }).eq("id", user.id);
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      user_id: user.id,
      evento: "session_completed",
      metadata: { materia: subject, area, duracao: minutesStudied, xp: xpGained },
    });

    setStep("done");
    toast({ title: `+${xpGained} XP! 🎉`, description: `Sessão de ${subject} concluída!` });
  }, [user, energy, subject, area, sessionSaved]);

  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");

  const startStudying = () => {
    setSeconds(totalSeconds);
    setRunning(true);
    setStep("studying");
    setPsychMsg("");
    setSessionSaved(false);
    startTimeRef.current = new Date();
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
          <motion.img
            src={mascotImage} alt="Mascote"
            className="w-20 h-20 mb-4"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-2 text-center">
            O que vamos estudar? 📚
          </h2>
          <p className="text-muted-foreground mb-8 text-center">Escolha uma matéria</p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {subjects.map((s) => (
              <motion.button
                key={s.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSubject(s.label); setArea(s.area); setStep("energy"); }}
                className="bg-card rounded-2xl shadow-card p-5 text-center hover:shadow-elevated transition-shadow"
              >
                <span className="text-3xl block mb-2">{s.emoji}</span>
                <span className="font-display font-bold text-sm text-foreground">{s.label}</span>
              </motion.button>
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
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-2 text-center">
            Como está sua energia? 🔋
          </h2>
          <p className="text-muted-foreground mb-8 text-center">
            Estudando <span className="font-semibold text-foreground">{subject}</span>
          </p>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            {energyLevels.map((e, i) => (
              <motion.button
                key={e.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setEnergy(i); startStudying(); }}
                className={`rounded-2xl border-2 p-6 text-center transition-all ${e.color}`}
              >
                <span className="text-4xl block mb-2">{e.emoji}</span>
                <span className="font-display font-bold text-lg text-foreground block">{e.label}</span>
                <span className="text-sm text-muted-foreground">{e.desc} · {e.minutes} min</span>
                <span className="block text-xs text-primary mt-1">+{Math.round(e.minutes * e.xpMultiplier)} XP</span>
              </motion.button>
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
          <Button variant="ghost" size="sm" onClick={() => setLofiPlaying(!lofiPlaying)} className="gap-1 text-xs">
            {lofiPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Lofi
          </Button>
        </div>

        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12">
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

          <div className="w-full max-w-xs mb-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">{Math.round(progress)}% concluído</p>
          </div>

          <AnimatePresence>
            {psychMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-primary/10 rounded-xl px-4 py-2 mb-4"
              >
                <p className="text-sm font-display font-semibold text-primary text-center">{psychMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <Button variant="hero" size="lg" onClick={() => setRunning(!running)} className="rounded-full w-16 h-16">
              {running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
            </Button>
          </div>

          <Button
            variant="ghost" size="sm"
            onClick={() => { setRunning(false); setStep("break"); }}
            className="mt-6 gap-2 text-muted-foreground"
          >
            <Coffee className="h-4 w-4" /> Pausa inteligente
          </Button>
        </div>

        {lofiPlaying && (
          <audio autoPlay loop>
            <source src="https://streams.fluxfm.de/Chillhop/mp3-128/streams.fluxfm.de/" type="audio/mpeg" />
          </audio>
        )}
      </section>
    );
  }

  // Break
  if (step === "break") {
    return (
      <BreakScreen
        subject={subject}
        onResume={() => { setRunning(true); setStep("studying"); }}
        onEnd={() => completeSession()}
      />
    );
  }

  // Done
  return (
    <section className="min-h-[100dvh] flex flex-col">
      <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-7xl mb-4"
        >
          🏆
        </motion.div>
        <h2 className="font-display font-extrabold text-3xl text-foreground mb-3">Sessão completa!</h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-xl text-primary">+{earnedXp} XP</span>
          </div>
          <p className="text-muted-foreground text-sm mb-1">{subject} · {energy !== null ? energyLevels[energy].minutes : 0} min</p>
          <p className="text-muted-foreground text-xs mb-8">Cada minuto te aproxima da aprovação! 🎯</p>
        </motion.div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="hero" size="lg" onClick={() => { setStep("subject"); setEnergy(null); setSessionSaved(false); }} className="rounded-full gap-2">
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
