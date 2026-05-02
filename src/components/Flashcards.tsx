import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, ThumbsDown, ThumbsUp, Smile, Frown } from "lucide-react";

const sampleCards = [
  { front: "O que é Fotossíntese?", back: "Processo que plantas usam para converter luz solar em energia (glicose), liberando O₂.", subject: "Biologia" },
  { front: "Fórmula de Bhaskara?", back: "x = (-b ± √(b²-4ac)) / 2a", subject: "Matemática" },
  { front: "Quando foi a Independência do Brasil?", back: "7 de setembro de 1822, às margens do Ipiranga.", subject: "História" },
  { front: "O que é uma Oração Subordinada?", back: "Uma oração que depende de outra (principal) para ter sentido completo.", subject: "Português" },
  { front: "Lei de Newton (2ª)?", back: "F = m × a — Força é igual a massa vezes aceleração.", subject: "Física" },
];

export default function Flashcards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const card = sampleCards[index];
  const next = () => {
    setFlipped(false);
    setReviewed((r) => r + 1);
    setIndex((i) => (i + 1) % sampleCards.length);
  };

  return (
    <section id="flashcards" className="py-16 md:py-24 bg-muted/50">
      <div className="container max-w-lg">
        <div className="text-center mb-8">
          <h2 className="font-display font-800 text-3xl md:text-4xl text-foreground mb-3">
            Flashcards <span className="text-gradient-primary">Inteligentes</span>
          </h2>
          <p className="text-muted-foreground">Repetição espaçada automática. Revise o que importa.</p>
        </div>

        {/* Card */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="relative bg-card rounded-2xl shadow-elevated p-8 min-h-[240px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-card mb-6"
          style={{ perspective: "1000px" }}
        >
          <span className="absolute top-3 left-4 text-[10px] font-medium rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground">
            {card.subject}
          </span>
          <span className="absolute top-3 right-4 text-[10px] text-muted-foreground">
            {index + 1}/{sampleCards.length}
          </span>
          <p className="font-display font-bold text-xl text-center text-foreground">
            {flipped ? card.back : card.front}
          </p>
          {!flipped && (
            <p className="text-xs text-muted-foreground mt-4">Toque para ver resposta</p>
          )}
        </div>

        {/* Rating buttons */}
        {flipped && (
          <div className="flex justify-center gap-3 mb-6 animate-slide-up">
            <Button variant="outline" size="sm" onClick={next} className="gap-1 text-destructive border-destructive/30">
              <Frown className="h-4 w-4" /> Esqueci
            </Button>
            <Button variant="outline" size="sm" onClick={next} className="gap-1 text-warning border-warning/30">
              <ThumbsDown className="h-4 w-4" /> Difícil
            </Button>
            <Button variant="outline" size="sm" onClick={next} className="gap-1 text-primary border-primary/30">
              <ThumbsUp className="h-4 w-4" /> Bom
            </Button>
            <Button variant="outline" size="sm" onClick={next} className="gap-1 text-success border-success/30">
              <Smile className="h-4 w-4" /> Fácil
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          ✅ {reviewed} cartões revisados hoje
        </div>
      </div>
    </section>
  );
}
