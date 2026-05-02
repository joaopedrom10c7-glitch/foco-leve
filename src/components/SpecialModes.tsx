import { Moon, GraduationCap, HeartPulse } from "lucide-react";

const specialModes = [
  {
    icon: Moon,
    label: "Modo Madrugada",
    desc: "Tela escura, sessões curtas, som ambiente suave",
    color: "bg-info/10 text-info border-info/30",
  },
  {
    icon: GraduationCap,
    label: "Modo Vestibular",
    desc: "Foco total, simulados, timer rigoroso",
    color: "bg-accent/10 text-accent border-accent/30",
  },
  {
    icon: HeartPulse,
    label: "Modo Recuperação",
    desc: "Sessões leves, sem pressão, no seu ritmo",
    color: "bg-success/10 text-success border-success/30",
  },
];

export default function SpecialModes() {
  return (
    <section className="py-12 md:py-20 bg-muted/50">
      <div className="container max-w-lg">
        <h2 className="font-display font-800 text-2xl md:text-3xl text-foreground mb-2 text-center">
          Modos <span className="text-gradient-primary">especiais</span>
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-8">Para cada momento da sua jornada.</p>

        <div className="flex flex-col gap-3">
          {specialModes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all hover:shadow-card active:scale-[0.98] ${m.color}`}
              >
                <Icon className="h-8 w-8 shrink-0" />
                <div>
                  <p className="font-display font-bold text-base">{m.label}</p>
                  <p className="text-xs opacity-70">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
