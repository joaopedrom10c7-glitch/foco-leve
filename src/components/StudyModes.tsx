import { Timer, Brain, Layers, Zap, RefreshCw, Target } from "lucide-react";

const modes = [
  { name: "Modo Pomodoro", key: "pomodoro", icon: Timer, desc: "25 min foco + 5 pausa", color: "bg-primary/10 text-primary border-primary/20" },
  { name: "Modo Revisão Ativa", key: "revisao", icon: Brain, desc: "Teste sua memória", color: "bg-accent/10 text-accent border-accent/20" },
  { name: "Modo Flashcard", key: "flashcard", icon: Layers, desc: "Cartões rápidos", color: "bg-info/10 text-info border-info/20" },
  { name: "Modo ENEM Sprint", key: "sprint", icon: Zap, desc: "Simulação cronometrada", color: "bg-warning/10 text-warning border-warning/20" },
  { name: "Modo Revisão 7 dias", key: "revisao7", icon: RefreshCw, desc: "Espaçada automática", color: "bg-success/10 text-success border-success/20" },
  { name: "Modo Recuperação", key: "recuperacao", icon: Target, desc: "Sessões leves", color: "bg-primary/10 text-primary border-primary/20" },
];

interface Props {
  onModeSelect: (mode: string) => void;
}

export default function StudyModes({ onModeSelect }: Props) {
  return (
    <section className="py-12 md:py-20">
      <div className="container max-w-lg">
        <h2 className="font-display font-800 text-2xl md:text-3xl text-foreground mb-2 text-center">
          Modos de <span className="text-gradient-primary">Estudo</span>
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-8">Escolha seu estilo — cada modo é um botão.</p>

        <div className="grid grid-cols-2 gap-3">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.name}
                onClick={() => onModeSelect(m.key)}
                className={`rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-1 hover:shadow-card active:scale-95 ${m.color}`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <p className="font-display font-bold text-sm">{m.name}</p>
                <p className="text-xs opacity-70">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
