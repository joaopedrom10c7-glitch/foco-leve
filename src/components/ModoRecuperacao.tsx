import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HeartPulse, Play, Pause, Sparkles, Heart } from "lucide-react";
import mascotImage from "@/assets/mascot-foco.png";

const gentleMessages = [
  "Você voltou. Isso já importa. 💛",
  "Não precisa ser perfeito. Só precisa começar.",
  "Cada minuto que você estuda é uma vitória.",
  "Tá difícil? Tudo bem. Estou aqui com você.",
  "Sua jornada é única. Respeite seu ritmo.",
];

const microTasks = [
  "📖 Leia 1 parágrafo de qualquer matéria",
  "🧠 Tente lembrar 3 coisas que aprendeu recentemente",
  "📝 Escreva 2 frases sobre qualquer tema do ENEM",
  "💡 Pense em 1 exemplo real de um conceito que estudou",
  "🔄 Releia suas anotações mais recentes",
  "📐 Resolva 1 conta simples de matemática",
  "🌍 Pense em 1 fato de geografia que você sabe",
  "📜 Lembre 1 evento histórico e por que ele importa",
  "🧪 Escreva o nome de 3 elementos químicos e seus símbolos",
  "🧬 Explique em 1 frase o que é uma célula",
  "⚡ Diga em voz alta a fórmula da velocidade média",
  "📊 Faça uma regra de três com números fáceis",
  "✍️ Escreva uma frase de introdução para uma redação",
  "🗣 Explique um conceito difícil como se fosse para uma criança",
  "📚 Liste 3 obras literárias que você conhece",
  "🌱 Cite 2 impactos ambientais do desmatamento",
  "🏛 Lembre 3 direitos garantidos pela Constituição de 1988",
  "🔤 Revise a diferença entre 'mas' e 'mais'",
  "🧮 Resolva 1 equação do 1º grau simples",
  "🌡 Converta 1 temperatura de Celsius para Fahrenheit",
  "🗺 Aponte no mapa mental as 5 regiões do Brasil",
  "💬 Escreva 1 argumento a favor de um tema atual",
  "🧠 Faça 1 flashcard novo de qualquer matéria",
  "📈 Interprete um gráfico simples que você lembrar",
  "🔬 Explique em 1 frase a diferença entre mitose e meiose",
  "🕰 Cite 2 causas da Primeira Guerra Mundial",
  "🎨 Lembre 1 movimento artístico e sua característica",
  "📖 Leia 1 questão do ENEM sem responder, só entendendo",
  "🧾 Revise a fórmula da área do triângulo",
  "🌊 Explique em 1 frase o ciclo da água",
  "💰 Pense em 1 conceito de economia que ouviu no noticiário",
  "🗞 Lembre 1 notícia recente que pode virar tema de redação",
  "🔋 Diferencie energia renovável de não renovável em 1 frase",
  "🧭 Revise a diferença entre latitude e longitude",
  "📌 Escolha 1 assunto que te dá medo e escreva por quê",
];

const completionRewards = [
  "Você é incrível! 🎉 Completou a sessão!",
  "Pequenos passos, grandes resultados! ⭐",
  "Uau! Você fez mais do que imagina! 💪",
  "Sessão feita! Seu futuro eu agradece! 🌟",
];

export default function ModoRecuperacao({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<"ask" | "studying" | "done">("ask");
  const [duration, setDuration] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");
  const [messageIndex] = useState(Math.floor(Math.random() * gentleMessages.length));

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && phase === "studying" && running) {
      setRunning(false);
      setPhase("done");
    }
  }, [seconds, phase, running]);

  const startSession = (mins: number) => {
    setDuration(mins);
    setSeconds(mins * 60);
    setTask(microTasks[Math.floor(Math.random() * microTasks.length)]);
    setPhase("studying");
    setRunning(true);
  };

  const progress = duration * 60 > 0 ? ((duration * 60 - seconds) / (duration * 60)) * 100 : 0;
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");

  if (phase === "ask") {
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        <div className="container py-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </div>
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
          <img src={mascotImage} alt="Mascote" className="w-20 h-20 mb-4 animate-float" />
          <HeartPulse className="h-10 w-10 text-success mb-3 animate-pulse-soft" />
          <h2 className="font-display font-800 text-2xl text-foreground mb-2">Modo Recuperação 💚</h2>
          <p className="text-muted-foreground text-sm mb-2">{gentleMessages[messageIndex]}</p>
          <p className="text-foreground font-display font-bold text-lg mb-6">
            Quanto tempo você consegue estudar hoje?
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[5, 10, 15].map(m => (
              <button
                key={m}
                onClick={() => startSession(m)}
                className="rounded-2xl border-2 border-success/30 bg-success/5 p-5 text-center transition-all hover:bg-success/10 hover:-translate-y-1 active:scale-95"
              >
                <span className="font-display font-bold text-2xl text-success">{m} min</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {m === 5 ? "Micro sessão" : m === 10 ? "Sessão leve" : "Sessão tranquila"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (phase === "studying") {
    return (
      <section className="min-h-[100dvh] flex flex-col bg-background">
        <div className="container py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <span className="text-xs text-success">💚 Recuperação • {duration} min</span>
        </div>
        <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12">
          {/* Single task */}
          <div className="bg-success/5 border-2 border-success/20 rounded-2xl p-6 mb-6 w-full max-w-sm animate-fade-in">
            <p className="text-xs text-success font-medium mb-2">Sua tarefa agora:</p>
            <p className="font-display font-bold text-lg text-foreground">{task}</p>
          </div>

          {/* Timer */}
          <span className="font-display font-bold text-5xl text-foreground mb-2">{min}:{sec}</span>
          <div className="w-full max-w-xs mb-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <Button variant="hero" size="lg" onClick={() => setRunning(!running)} className="rounded-full w-14 h-14">
              {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTask(microTasks[Math.floor(Math.random() * microTasks.length)])}
            className="text-xs text-muted-foreground"
          >
            🔄 Trocar tarefa
          </Button>
        </div>
      </section>
    );
  }

  // Done
  const reward = completionRewards[Math.floor(Math.random() * completionRewards.length)];
  return (
    <section className="min-h-[100dvh] flex flex-col bg-background">
      <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 text-center">
        <Heart className="h-14 w-14 text-success mb-4 animate-float" />
        <h2 className="font-display font-900 text-2xl text-foreground mb-3">{reward}</h2>
        <p className="text-success font-semibold mb-2">+{duration * 3} XP ganhos!</p>
        <p className="text-muted-foreground text-sm mb-8">Estudou {duration} minutos. Isso é progresso real.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button variant="hero" size="lg" onClick={() => setPhase("ask")} className="rounded-full gap-2">
            <Sparkles className="h-5 w-5" /> Mais uma sessão
          </Button>
          <Button variant="calm" size="lg" onClick={onBack} className="rounded-full">
            Voltar ao início
          </Button>
        </div>
      </div>
    </section>
  );
}
