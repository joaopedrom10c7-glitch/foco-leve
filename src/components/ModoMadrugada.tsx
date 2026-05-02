import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Pause, Moon, Volume2, VolumeX, Coffee } from "lucide-react";
import mascotImage from "@/assets/mascot-foco.png";

const nightPhrases = [
  "Só mais um pouco. 🌙",
  "Você já chegou até aqui.",
  "O silêncio é seu aliado.",
  "Madrugada de foco, manhã de orgulho.",
  "Cada minuto conta. Vai com calma.",
];

const AMBIENT_SOUNDS = [
  { label: "🌧 Chuva", url: "https://cdn.pixabay.com/audio/2022/05/31/audio_89a1be5e59.mp3" },
  { label: "🎵 Lofi", url: "https://streams.fluxfm.de/Chillhop/mp3-128/streams.fluxfm.de/" },
  { label: "🔇 Silêncio", url: "" },
];

export default function ModoMadrugada({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<"ready" | "studying" | "break" | "done">("ready");
  const [seconds, setSeconds] = useState(20 * 60);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [soundIndex, setSoundIndex] = useState(2); // silence default
  const [phraseIndex, setPhraseIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = 20 * 60;
  const breakSeconds = 3 * 60;

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = window.setInterval(() => setSeconds(s => s - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (seconds === 0 && phase === "studying") {
        setSessionCount(c => c + 1);
        setPhase("done");
      }
      if (seconds === 0 && phase === "break") {
        setSeconds(totalSeconds);
        setPhase("studying");
        setRunning(true);
        setPhraseIndex(i => (i + 1) % nightPhrases.length);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, seconds, phase]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const url = AMBIENT_SOUNDS[soundIndex].url;
    if (url && phase === "studying") {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
    return () => { audioRef.current?.pause(); };
  }, [soundIndex, phase]);

  const progress = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");

  if (phase === "ready") {
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        <div className="container py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </div>
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
          <Moon className="h-16 w-16 text-info mb-4 animate-pulse-soft" />
          <h2 className="font-display font-800 text-2xl text-foreground mb-2">Modo Madrugada 🌙</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sessões curtas de 20 min • Pausas de 3 min • Foco profundo
          </p>
          {sessionCount > 0 && (
            <p className="text-xs text-info mb-4">🌙 {sessionCount} sessão(ões) da madrugada hoje</p>
          )}
          <div className="flex flex-col gap-3 w-full max-w-xs mb-6">
            <p className="text-xs text-muted-foreground">Som ambiente:</p>
            <div className="flex gap-2 justify-center">
              {AMBIENT_SOUNDS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSoundIndex(i)}
                  className={`px-3 py-2 rounded-xl text-xs transition-all ${
                    i === soundIndex ? "bg-info/20 text-info border border-info/40" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={() => { setPhase("studying"); setRunning(true); setSeconds(totalSeconds); }}
            className="rounded-full gap-2 px-10"
          >
            <Moon className="h-5 w-5" /> Começar sessão
          </Button>
        </div>
      </section>
    );
  }

  if (phase === "studying") {
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        <div className="container py-4 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">🌙 Madrugada • Sessão {sessionCount + 1}</span>
          <div className="flex gap-2">
            {AMBIENT_SOUNDS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSoundIndex(i)}
                className={`px-2 py-1 rounded-lg text-xs ${
                  i === soundIndex ? "bg-info/20 text-info" : "text-muted-foreground"
                }`}
              >
                {i === soundIndex ? <Volume2 className="h-3 w-3 inline" /> : <VolumeX className="h-3 w-3 inline" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12">
          <div className="relative w-56 h-56 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="112" fill="none" strokeWidth="8" className="stroke-muted" />
              <circle cx="128" cy="128" r="112" fill="none" strokeWidth="8" className="stroke-info transition-all duration-1000"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 112} strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-5xl text-foreground">{min}:{sec}</span>
            </div>
          </div>
          <p className="text-sm text-info mb-6 italic animate-fade-in">"{nightPhrases[phraseIndex]}"</p>
          <div className="flex gap-4">
            <Button variant="hero" size="lg" onClick={() => setRunning(!running)} className="rounded-full w-16 h-16">
              {running ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setRunning(false); setSeconds(breakSeconds); setPhase("break"); }} className="mt-4 gap-2 text-muted-foreground">
            <Coffee className="h-4 w-4" /> Pausa 3 min
          </Button>
        </div>
      </section>
    );
  }

  if (phase === "break") {
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
          <Moon className="h-12 w-12 text-info mb-4 animate-float" />
          <h2 className="font-display font-bold text-xl text-foreground mb-2">Pausa da madrugada ☕</h2>
          <p className="text-muted-foreground text-sm mb-4">Respire fundo. Volte em breve.</p>
          <span className="font-display font-bold text-4xl text-info mb-6">{min}:{sec}</span>
          <Button variant="hero" size="lg" onClick={() => { setSeconds(totalSeconds); setPhase("studying"); setRunning(true); }} className="rounded-full gap-2">
            <Play className="h-5 w-5" /> Voltar a estudar
          </Button>
        </div>
      </section>
    );
  }

  // Done
  return (
    <section className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
        <div className="text-6xl mb-4">🌙</div>
        <h2 className="font-display font-900 text-3xl text-foreground mb-3">Sessão da madrugada completa!</h2>
        <p className="text-info font-semibold mb-2">🌙 {sessionCount} sessão(ões) hoje</p>
        <p className="text-muted-foreground text-sm mb-8">+40 XP ganhos!</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="hero" size="lg" onClick={() => { setPhase("ready"); }} className="rounded-full gap-2">
            <Moon className="h-5 w-5" /> Mais uma sessão
          </Button>
          <Button variant="calm" size="lg" onClick={onBack} className="rounded-full">
            Voltar ao início
          </Button>
        </div>
      </div>
    </section>
  );
}
