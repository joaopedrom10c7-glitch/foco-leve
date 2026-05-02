import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Wind, BookOpen, Smile } from "lucide-react";

const calmMessages = [
  "Tudo bem não estar 100% hoje. 💛",
  "Só de abrir o app, você já está avançando.",
  "Vamos com calma. Uma coisa de cada vez.",
  "Você não precisa ser perfeito. Precisa ser consistente.",
];

export default function AnxietyMode() {
  const [active, setActive] = useState(false);
  const [messageIndex] = useState(Math.floor(Math.random() * calmMessages.length));

  if (!active) {
    return (
      <section className="py-12">
        <div className="container max-w-lg text-center">
          <Button
            variant="calm"
            size="lg"
            onClick={() => setActive(true)}
            className="gap-2 rounded-full px-8"
          >
            <Heart className="h-5 w-5 text-accent" />
            Hoje está difícil
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container max-w-lg">
        <div className="bg-card rounded-2xl shadow-elevated p-8 text-center animate-slide-up">
          <Heart className="h-10 w-10 text-accent mx-auto mb-4 animate-pulse-soft" />
          <h3 className="font-display font-bold text-xl text-foreground mb-3">
            Modo Ansiedade Zero
          </h3>
          <p className="text-muted-foreground mb-6">{calmMessages[messageIndex]}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="bg-secondary rounded-xl p-4 hover:bg-secondary/70 transition-colors">
              <Wind className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">Respiração 1 min</p>
            </button>
            <button className="bg-secondary rounded-xl p-4 hover:bg-secondary/70 transition-colors">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">Revisão leve</p>
            </button>
            <button className="bg-secondary rounded-xl p-4 hover:bg-secondary/70 transition-colors">
              <Smile className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">Sessão 5 min</p>
            </button>
            <button className="bg-secondary rounded-xl p-4 hover:bg-secondary/70 transition-colors">
              <Heart className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">Mensagem calma</p>
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setActive(false)}>
            Voltar
          </Button>
        </div>
      </div>
    </section>
  );
}
