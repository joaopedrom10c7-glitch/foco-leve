import { Flame, Star, Zap, Trophy, Target, TrendingUp } from "lucide-react";

const stats = [
  { label: "Streak", value: "7 dias", icon: Flame, accent: "text-accent" },
  { label: "XP Total", value: "1.240", icon: Zap, accent: "text-warning" },
  { label: "Nível", value: "Focado", icon: Star, accent: "text-primary" },
  { label: "Conquistas", value: "12/50", icon: Trophy, accent: "text-info" },
];

const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
const weekProgress = [true, true, true, true, true, false, false]; // example

export default function ProgressDashboard() {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="font-display font-800 text-3xl md:text-4xl text-foreground mb-3">
            Seu <span className="text-gradient-primary">Progresso</span>
          </h2>
          <p className="text-muted-foreground">Cada passo conta. Veja como você está indo.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card rounded-xl shadow-card p-4 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${s.accent}`} />
                <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Weekly streak */}
        <div className="bg-card rounded-xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display font-bold text-foreground">Esta semana</h3>
          </div>
          <div className="flex justify-between">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all ${
                    weekProgress[i]
                      ? "bg-gradient-primary text-primary-foreground shadow-card"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {weekProgress[i] ? "✓" : day}
                </div>
                <span className="text-[10px] text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
