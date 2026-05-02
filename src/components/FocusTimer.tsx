import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Coffee } from "lucide-react";

const modes = [
  { label: "Começar", minutes: 10, color: "bg-success" },
  { label: "Foco", minutes: 25, color: "bg-primary" },
  { label: "ENEM", minutes: 45, color: "bg-accent" },
];

export default function FocusTimer() {
  const [selectedMode, setSelectedMode] = useState(1);
  const [seconds, setSeconds] = useState(modes[1].minutes * 60);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setSeconds(modes[selectedMode].minutes * 60);
    setRunning(false);
  }, [selectedMode]);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = window.setInterval(() => setSeconds((s) => s - 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, seconds]);

  const total = modes[selectedMode].minutes * 60;
  const progress = ((total - seconds) / total) * 100;
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");

  return (
    <section id="timer" className="py-16 md:py-24">
      <div className="container max-w-lg">
        <div className="text-center mb-8">
          <h2 className="font-display font-800 text-3xl md:text-4xl text-foreground mb-3">
            Timer de <span className="text-gradient-primary">Foco</span>
          </h2>
          <p className="text-muted-foreground">Escolha seu modo e comece a estudar.</p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 justify-center mb-8">
          {modes.map((m, i) => (
            <button
              key={m.label}
              onClick={() => setSelectedMode(i)}
              className={`px-4 py-2 rounded-full text-sm font-display font-semibold transition-all ${
                i === selectedMode
                  ? "bg-gradient-primary text-primary-foreground shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {m.label} ({m.minutes}min)
            </button>
          ))}
        </div>

        {/* Timer circle */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="112" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle
              cx="128" cy="128" r="112" fill="none" strokeWidth="8"
              className="stroke-primary transition-all duration-500"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 112}
              strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-5xl text-foreground">{min}:{sec}</span>
            <span className="text-sm text-muted-foreground mt-1">{modes[selectedMode].label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundOn(!soundOn)}
            className="rounded-full"
          >
            {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button
            variant="hero"
            size="lg"
            onClick={() => setRunning(!running)}
            className="rounded-full w-16 h-16"
          >
            {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setSeconds(total); setRunning(false); }}
            className="rounded-full"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="calm" size="sm" className="gap-2">
            <Coffee className="h-4 w-4" /> Pausa inteligente
          </Button>
        </div>
      </div>
    </section>
  );
}
