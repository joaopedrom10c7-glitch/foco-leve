import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import mascotImage from "@/assets/mascot-foco.png";

export default function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-[100dvh] flex flex-col">
      {/* Nav */}
      <nav className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">EstudaFácil</span>
        </div>
      </nav>

      {/* Hero — emotional, minimal */}
      <div className="flex-1 container flex flex-col items-center justify-center text-center px-6 pb-12">
        {/* Mascot */}
        <img
          src={mascotImage}
          alt="Coruja mascote do EstudaFácil"
          className="w-28 h-28 md:w-36 md:h-36 mb-6 animate-float drop-shadow-lg"
        />

        <p className="text-muted-foreground text-base md:text-lg max-w-sm mb-2 animate-slide-up">
          Sem pressão.<br />
          Sem metas impossíveis.<br />
          Só começar.
        </p>

        <h1 className="font-display font-900 text-3xl md:text-5xl text-foreground mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Estudar é <span className="text-gradient-primary">possível</span> pra você.
        </h1>

        {/* Giant CTA */}
        <Button
          variant="hero"
          size="lg"
          onClick={onStart}
          className="rounded-full px-10 py-7 text-lg md:text-xl gap-3 animate-slide-up shadow-elevated hover:scale-105 transition-transform"
          style={{ animationDelay: "0.2s" }}
        >
          <Sparkles className="h-6 w-6" />
          COMEÇAR ESTUDO LEVE
          <ChevronRight className="h-5 w-5" />
        </Button>

        <p className="text-xs text-muted-foreground mt-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          100% gratuito • Sem cadastro • 1 clique
        </p>
      </div>
    </section>
  );
}
