import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Brain, Star, Flame, Heart, Zap, Target, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const navItems = ["Métodos", "Timer", "Flashcards", "Plano"];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Nav */}
      <nav className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">EstudaFácil</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item}
            </a>
          ))}
        </div>
        <Button variant="hero" size="sm">Começar grátis</Button>
      </nav>

      {/* Hero */}
      <div className="container grid md:grid-cols-2 gap-8 items-center py-12 md:py-20">
        <div className="animate-slide-up space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
            <Flame className="h-4 w-4 text-accent" />
            +50 mil estudantes já usam
          </div>
          <h1 className="font-display font-900 text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
            Estudar pode ser{" "}
            <span className="text-gradient-primary">simples</span>
            <br />e até <span className="text-gradient-primary">divertido</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Métodos científicos de estudo em micro-sessões. Feito para quem procrastina, 
            estuda pelo celular e quer ir bem no ENEM.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="hero" size="lg" className="gap-2">
              Começar em 30 segundos
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="calm" size="lg">Ver métodos</Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning" /> 4.9/5</span>
            <span>•</span>
            <span>100% gratuito para começar</span>
          </div>
        </div>
        <div className="relative flex justify-center" style={{ animation: "float 3s ease-in-out infinite" }}>
          <img
            src={heroImage}
            alt="Estudante aprendendo com métodos inteligentes"
            width={1024}
            height={768}
            className="rounded-2xl shadow-elevated max-w-full h-auto"
          />
          {/* Floating badges */}
          <div className="absolute -left-2 top-1/4 bg-card rounded-xl shadow-card p-3 flex items-center gap-2 animate-slide-up">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Streak</p>
              <p className="text-xs text-muted-foreground">7 dias 🔥</p>
            </div>
          </div>
          <div className="absolute -right-2 bottom-1/4 bg-card rounded-xl shadow-card p-3 flex items-center gap-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center">
              <Target className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">XP Hoje</p>
              <p className="text-xs text-muted-foreground">+120 pontos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
