import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Sparkles, Calendar, BarChart3, Layers, BookText } from "lucide-react";
import { Link } from "react-router-dom";
import mascotImage from "@/assets/mascot-foco.png";

export default function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-[85dvh] flex flex-col">
      {/* Hero */}
      <div className="flex-1 container flex flex-col items-center justify-center text-center px-6 pb-8">
        <img
          src={mascotImage}
          alt="Coruja mascote FOCO LEVE"
          className="w-24 h-24 md:w-32 md:h-32 mb-4 animate-float drop-shadow-lg"
        />
        <p className="text-muted-foreground text-sm md:text-base max-w-sm mb-2 animate-fade-in">
          Sem pressão. Sem metas impossíveis. Só começar.
        </p>
        <h1 className="font-display font-900 text-3xl md:text-5xl text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Estudar é <span className="text-gradient-primary">possível</span> pra você.
        </h1>

        <Button
          variant="hero"
          size="lg"
          onClick={onStart}
          className="rounded-full px-10 py-7 text-lg md:text-xl gap-3 animate-fade-in shadow-elevated hover:scale-105 transition-transform"
          style={{ animationDelay: "0.2s" }}
        >
          <Sparkles className="h-6 w-6" />
          COMEÇAR ESTUDO LEVE
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2 mt-8 w-full max-w-sm animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {[
            { to: "/cronograma", icon: Calendar, label: "Cronograma", desc: "Planilha semanal" },
            { to: "/dashboard", icon: BarChart3, label: "Dashboard", desc: "Gráficos de estudo" },
            { to: "/flashcards", icon: Layers, label: "Flashcards", desc: "Repetição espaçada" },
            { to: "/repertorio", icon: BookText, label: "Repertório", desc: "Citações ENEM" },
          ].map(l => (
            <Link
              key={l.to} to={l.to}
              className="rounded-xl border border-border bg-card p-3 text-left hover:-translate-y-0.5 transition-transform shadow-card"
            >
              <l.icon className="h-5 w-5 text-primary mb-1" />
              <p className="font-display font-bold text-sm">{l.label}</p>
              <p className="text-[10px] text-muted-foreground">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
