import { BookOpen, Brain, RefreshCw, Lightbulb, Timer, Layers, Shuffle, FileText, GitBranch, Search, Clock, BarChart3, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const methods = [
  { name: "Pomodoro", icon: Timer, effort: "Baixo", desc: "Estude 25 min, descanse 5.", color: "bg-primary/10 text-primary" },
  { name: "Active Recall", icon: Brain, effort: "Médio", desc: "Teste sua memória ativamente.", color: "bg-accent/10 text-accent" },
  { name: "Repetição Espaçada", icon: RefreshCw, effort: "Baixo", desc: "Revise no momento certo.", color: "bg-info/10 text-info" },
  { name: "Técnica Feynman", icon: Lightbulb, effort: "Alto", desc: "Explique como se ensinasse.", color: "bg-warning/10 text-warning" },
  { name: "Blurting", icon: FileText, effort: "Médio", desc: "Escreva tudo que lembra.", color: "bg-success/10 text-success" },
  { name: "Flashcards", icon: Layers, effort: "Baixo", desc: "Cartões de revisão rápida.", color: "bg-primary/10 text-primary" },
  { name: "Interleaving", icon: Shuffle, effort: "Médio", desc: "Misture matérias diferentes.", color: "bg-accent/10 text-accent" },
  { name: "Método 80/20", icon: BarChart3, effort: "Baixo", desc: "Foque no que mais cai.", color: "bg-info/10 text-info" },
  { name: "SQ3R", icon: Search, effort: "Alto", desc: "Leitura estratégica de textos.", color: "bg-warning/10 text-warning" },
  { name: "Regra dos 2 min", icon: Clock, effort: "Mínimo", desc: "Se leva 2 min, faça agora.", color: "bg-success/10 text-success" },
  { name: "Mapas Mentais", icon: GitBranch, effort: "Médio", desc: "Organize ideias visualmente.", color: "bg-primary/10 text-primary" },
  { name: "Estudo por Questões", icon: HelpCircle, effort: "Médio", desc: "Aprenda resolvendo questões.", color: "bg-accent/10 text-accent" },
];

export default function StudyMethods() {
  return (
    <section id="métodos" className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display font-800 text-3xl md:text-4xl text-foreground mb-3">
            Métodos que <span className="text-gradient-primary">funcionam</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Baseados em neurociência. Escolha o ideal para cada momento.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {methods.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className="group bg-card rounded-xl p-4 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className={`h-10 w-10 rounded-lg ${m.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-1">{m.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{m.desc}</p>
                <span className="inline-block text-[10px] font-medium rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                  Esforço: {m.effort}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
