import { useState } from "react";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { useSubscription, PlanType } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap, Shield, Star, Rocket } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    id: "free" as PlanType,
    name: "Gratuito",
    price: "R$0",
    period: "/mês",
    desc: "Para começar com o essencial",
    icon: Star,
    features: [
      "Métodos de estudo básicos",
      "Timer Pomodoro",
      "5 flashcards/dia",
      "Planejador simples",
      "Progresso básico",
    ],
    cta: "Plano atual",
    popular: false,
    gradient: false,
  },
  {
    id: "pro" as PlanType,
    name: "Pro",
    price: "R$14,90",
    period: "/mês",
    desc: "Para quem leva a sério",
    icon: Sparkles,
    features: [
      "Tudo do Gratuito",
      "IA personalizada completa",
      "Flashcards ilimitados",
      "Simulados ENEM",
      "Estatísticas avançadas",
      "Trilhas automáticas",
      "Modo foco profundo",
      "Temas exclusivos",
      "Relatório semanal PDF",
    ],
    cta: "Assinar Pro",
    popular: true,
    gradient: false,
  },
  {
    id: "ultra" as PlanType,
    name: "Ultra",
    price: "R$29,90",
    period: "/mês",
    desc: "Máximo desempenho",
    icon: Rocket,
    features: [
      "Tudo do Pro",
      "Suporte prioritário",
      "Mentoria IA avançada",
      "Análise preditiva de nota",
      "Plano de recuperação automático",
      "Acesso antecipado a novidades",
      "Badge exclusivo Ultra ⚡",
    ],
    cta: "Assinar Ultra",
    popular: false,
    gradient: true,
  },
];

export default function PlanosPage() {
  const { plan: currentPlan } = useSubscription();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const handleSubscribe = (planId: PlanType) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (planId === "free") return;
    toast({
      title: "🚀 Em breve!",
      description: "O sistema de pagamento será ativado em breve. Fique ligado!",
    });
  };

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-24">
        <div className="container py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-display font-extrabold text-4xl md:text-5xl mb-3">
              Escolha seu <span className="text-gradient-primary">plano</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Comece grátis. Evolua quando sentir que precisa de mais.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Anual <span className="text-xs ml-1 text-accent">-20%</span>
              </button>
            </div>
          </motion.div>

          {/* Plans grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p, i) => {
              const Icon = p.icon;
              const isCurrent = currentPlan === p.id;
              const yearlyPrice = p.id === "pro" ? "R$11,90" : p.id === "ultra" ? "R$23,90" : "R$0";
              const displayPrice = billing === "yearly" && p.id !== "free" ? yearlyPrice : p.price;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    p.popular
                      ? "bg-card border-2 border-primary/40 shadow-elevated"
                      : p.gradient
                      ? "bg-gradient-to-br from-primary/10 to-accent/10 border border-accent/30 shadow-elevated"
                      : "bg-card border border-border shadow-card"
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-card">
                        <Crown className="h-3 w-3" /> MAIS POPULAR
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${p.popular ? "text-primary" : p.gradient ? "text-accent" : "text-muted-foreground"}`} />
                    <h3 className="font-display font-bold text-xl">{p.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>

                  <div className="mb-6">
                    <span className="font-display font-extrabold text-4xl">{displayPrice}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                    {billing === "yearly" && p.id !== "free" && (
                      <p className="text-xs text-accent mt-1">Economia de 20% no plano anual</p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${p.popular ? "text-primary" : p.gradient ? "text-accent" : "text-primary/70"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={p.popular ? "hero" : p.gradient ? "accent" : "calm"}
                    className="w-full rounded-xl h-12 text-base"
                    onClick={() => handleSubscribe(p.id)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "✅ Plano atual" : p.cta}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-2 bg-card rounded-full px-6 py-3 shadow-card">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">7 dias de garantia · Cancele quando quiser</span>
            </div>
          </motion.div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
