import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles } from "lucide-react";

const free = ["Métodos de estudo", "Timer básico", "5 flashcards/dia", "Planejador simples"];
const pro = [
  "Tudo do Gratuito",
  "IA personalizada completa",
  "Flashcards ilimitados",
  "Simulados ENEM",
  "Estatísticas avançadas",
  "Trilhas automáticas",
  "Modo foco profundo",
  "Temas exclusivos",
];

export default function Pricing() {
  return (
    <section id="plano" className="py-16 md:py-24 bg-muted/50">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display font-800 text-3xl md:text-4xl text-foreground mb-3">
            Planos <span className="text-gradient-primary">acessíveis</span>
          </h2>
          <p className="text-muted-foreground">Comece grátis. Evolua quando quiser.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-card rounded-2xl shadow-card p-6">
            <h3 className="font-display font-bold text-lg text-foreground mb-1">Gratuito</h3>
            <p className="text-muted-foreground text-sm mb-4">Para começar com o essencial</p>
            <p className="font-display font-bold text-3xl text-foreground mb-6">R$0<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
            <ul className="space-y-2 mb-6">
              {free.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button variant="calm" className="w-full">Começar grátis</Button>
          </div>

          {/* Pro */}
          <div className="relative bg-card rounded-2xl shadow-elevated p-6 border-2 border-primary/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 bg-gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-card">
                <Crown className="h-3 w-3" /> POPULAR
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> EstudaFácil Pro
            </h3>
            <p className="text-muted-foreground text-sm mb-4">Para quem leva a sério</p>
            <p className="font-display font-bold text-3xl text-foreground mb-6">
              R$14,90<span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>
            <ul className="space-y-2 mb-6">
              {pro.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-accent" /> {p}
                </li>
              ))}
            </ul>
            <Button variant="hero" className="w-full">Assinar Pro</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
