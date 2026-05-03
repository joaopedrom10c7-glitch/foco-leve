import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { HandMetal, Timer, Zap, Brain, Play } from "lucide-react";

const MICRO_TASKS = [
  { label: "Leia 1 parágrafo do resumo", icon: "📖", duracao: 2 },
  { label: "Responda 1 questão fácil", icon: "✅", duracao: 3 },
  { label: "Revise 3 flashcards", icon: "🃏", duracao: 2 },
  { label: "Escreva 1 frase sobre o tema", icon: "✍️", duracao: 1 },
  { label: "Assista 1 min de resumo", icon: "🎬", duracao: 1 },
];

interface Props {
  onStartFocus?: () => void;
}

export default function AntiProcrastinationButton({ onStartFocus }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(300); // 5 min
  const [task, setTask] = useState(MICRO_TASKS[0]);
  const [counting, setCounting] = useState(false);

  const activate = async () => {
    const randomTask = MICRO_TASKS[Math.floor(Math.random() * MICRO_TASKS.length)];
    setTask(randomTask);
    setActive(true);
    setCounting(true);
    setTimer(300);

    if (user) {
      await supabase.from("analytics_events").insert({
        user_id: user.id,
        evento: "anti_procrastination_activated",
        metadata: { task: randomTask.label },
      });
    }
  };

  useEffect(() => {
    if (!counting || timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [counting, timer]);

  useEffect(() => {
    if (timer <= 0 && counting) {
      setCounting(false);
      toast({ title: "5 minutos completados! 🎉", description: "Viu? Não foi tão difícil." });
      if (user) {
        supabase.from("focus_sessions").insert({
          user_id: user.id,
          materia: "anti-procrastinação",
          duracao: 5,
          completado: true,
          procrastinacao_trigger: "button",
        });
      }
    }
  }, [timer, counting]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={activate}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-destructive text-destructive-foreground rounded-full px-5 py-3 shadow-elevated flex items-center gap-2 font-display font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <HandMetal className="h-5 w-5" />
        NÃO CONSIGO COMEÇAR
      </motion.button>

      {/* Focus overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-background/98 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-sm w-full text-center space-y-6"
            >
              <div className="text-5xl">{task.icon}</div>
              <h2 className="font-display font-bold text-2xl">Micro-tarefa</h2>
              <p className="text-lg text-muted-foreground">{task.label}</p>

              {/* Timer */}
              <div className="relative mx-auto w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - timer / 300)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono font-bold text-2xl">{formatTime(timer)}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {timer > 240 ? "Só 5 minutos. Você consegue." :
                 timer > 120 ? "Metade já passou!" :
                 timer > 0 ? "Quase lá, continua!" :
                 "Pronto! Você venceu a procrastinação 🏆"}
              </p>

              <div className="flex gap-3 justify-center">
                {timer > 0 ? (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => { setActive(false); setCounting(false); }}
                  >
                    Cancelar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="hero"
                      className="rounded-full"
                      onClick={() => { setActive(false); onStartFocus?.(); }}
                    >
                      <Play className="h-4 w-4 mr-1" /> Continuar estudando
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setActive(false)}
                    >
                      Parar por agora
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
