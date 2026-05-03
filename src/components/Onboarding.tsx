import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Target, Clock, BookOpen, Sparkles } from "lucide-react";
import mascotImage from "@/assets/mascot-foco.png";

const OBJETIVOS = [
  { id: "enem", label: "ENEM", icon: "🎯" },
  { id: "vestibular", label: "Vestibular", icon: "🏫" },
  { id: "reforco", label: "Reforço Escolar", icon: "📚" },
];

const FREQUENCIAS = [
  { id: 2, label: "2x por semana", desc: "Leve e constante" },
  { id: 3, label: "3x por semana", desc: "Equilíbrio ideal" },
  { id: 5, label: "5x por semana", desc: "Foco total" },
  { id: 7, label: "Todo dia", desc: "Maratonista" },
];

const HORARIOS = [
  { id: "manha", label: "Manhã", desc: "6h - 12h", icon: "☀️" },
  { id: "tarde", label: "Tarde", desc: "12h - 18h", icon: "🌤️" },
  { id: "noite", label: "Noite", desc: "18h - 22h", icon: "🌙" },
  { id: "madrugada", label: "Madrugada", desc: "22h - 6h", icon: "🌌" },
];

interface Subarea {
  id: string;
  label: string;
}

interface Area {
  id: string;
  label: string;
  cor: string;
  subareas: Subarea[];
}

const AREAS: Area[] = [
  {
    id: "biologia", label: "Biologia", cor: "hsl(145 60% 45%)",
    subareas: [
      { id: "citologia", label: "Citologia" },
      { id: "genetica", label: "Genética" },
      { id: "ecologia", label: "Ecologia" },
      { id: "fisiologia", label: "Fisiologia" },
      { id: "evolucao", label: "Evolução" },
    ],
  },
  {
    id: "matematica", label: "Matemática", cor: "hsl(15 85% 60%)",
    subareas: [
      { id: "funcoes", label: "Funções" },
      { id: "geometria", label: "Geometria" },
      { id: "estatistica", label: "Estatística" },
      { id: "algebra", label: "Álgebra" },
      { id: "probabilidade", label: "Probabilidade" },
    ],
  },
  {
    id: "fisica", label: "Física", cor: "hsl(210 80% 55%)",
    subareas: [
      { id: "cinematica", label: "Cinemática" },
      { id: "termologia", label: "Termologia" },
      { id: "optica", label: "Óptica" },
      { id: "eletricidade", label: "Eletricidade" },
      { id: "ondulatoria", label: "Ondulatória" },
    ],
  },
  {
    id: "quimica", label: "Química", cor: "hsl(280 60% 55%)",
    subareas: [
      { id: "organica", label: "Orgânica" },
      { id: "estequiometria", label: "Estequiometria" },
      { id: "ligacoes", label: "Ligações Químicas" },
      { id: "termoquimica", label: "Termoquímica" },
      { id: "eletroquimica", label: "Eletroquímica" },
    ],
  },
  {
    id: "linguagens", label: "Linguagens", cor: "hsl(40 90% 55%)",
    subareas: [
      { id: "interpretacao", label: "Interpretação de Texto" },
      { id: "gramatica", label: "Gramática" },
      { id: "redacao", label: "Redação" },
      { id: "literatura", label: "Literatura" },
    ],
  },
  {
    id: "humanas", label: "Humanas", cor: "hsl(0 70% 55%)",
    subareas: [
      { id: "historia", label: "História" },
      { id: "geografia", label: "Geografia" },
      { id: "filosofia", label: "Filosofia" },
      { id: "sociologia", label: "Sociologia" },
    ],
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Preferences
  const [objetivo, setObjetivo] = useState("");
  const [frequencia, setFrequencia] = useState(3);
  const [horarios, setHorarios] = useState<string[]>([]);
  const [selectedSubareas, setSelectedSubareas] = useState<Record<string, string[]>>({});
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  const toggleHorario = (id: string) => {
    setHorarios(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  const toggleSubarea = (areaId: string, subareaId: string) => {
    setSelectedSubareas(prev => {
      const current = prev[areaId] || [];
      const updated = current.includes(subareaId)
        ? current.filter(s => s !== subareaId)
        : [...current, subareaId];
      return { ...prev, [areaId]: updated };
    });
  };

  const selectAllSubareas = (area: Area) => {
    const allIds = area.subareas.map(s => s.id);
    const current = selectedSubareas[area.id] || [];
    const allSelected = allIds.every(id => current.includes(id));
    setSelectedSubareas(prev => ({
      ...prev,
      [area.id]: allSelected ? [] : allIds,
    }));
  };

  const totalSubareas = Object.values(selectedSubareas).flat().length;

  const canProceed = () => {
    if (step === 0) return !!objetivo;
    if (step === 1) return true;
    if (step === 2) return horarios.length > 0;
    if (step === 3) return totalSubareas > 0;
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const preferences = {
      objetivo,
      frequencia,
      horarios,
      materias: selectedSubareas,
      onboarding_complete: true,
    };

    const { error } = await supabase
      .from("profiles")
      .update({ study_preference: preferences })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil configurado! 🎉", description: "Vamos começar seus estudos." });
      onComplete();
    }
  };

  const steps = [
    // Step 0: Objetivo
    <div key="objetivo" className="space-y-4">
      <div className="text-center mb-6">
        <img src={mascotImage} alt="Mascote" className="w-16 h-16 mx-auto mb-3" />
        <h2 className="font-display font-bold text-2xl">Qual seu objetivo?</h2>
        <p className="text-muted-foreground text-sm mt-1">Isso ajuda a personalizar seu plano</p>
      </div>
      <div className="space-y-3">
        {OBJETIVOS.map(obj => (
          <button
            key={obj.id}
            onClick={() => setObjetivo(obj.id)}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
              objetivo === obj.id
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border hover:border-primary/40"
            }`}
          >
            <span className="text-2xl mr-3">{obj.icon}</span>
            <span className="font-display font-semibold text-lg">{obj.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Frequência
    <div key="frequencia" className="space-y-4">
      <div className="text-center mb-6">
        <Target className="w-10 h-10 mx-auto mb-2 text-primary" />
        <h2 className="font-display font-bold text-2xl">Quantas vezes por semana?</h2>
        <p className="text-muted-foreground text-sm mt-1">Sem pressão, você pode mudar depois</p>
      </div>
      <div className="space-y-3">
        {FREQUENCIAS.map(f => (
          <button
            key={f.id}
            onClick={() => setFrequencia(f.id)}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
              frequencia === f.id
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="font-display font-semibold">{f.label}</div>
            <div className="text-sm text-muted-foreground">{f.desc}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Horários
    <div key="horarios" className="space-y-4">
      <div className="text-center mb-6">
        <Clock className="w-10 h-10 mx-auto mb-2 text-primary" />
        <h2 className="font-display font-bold text-2xl">Melhores horários?</h2>
        <p className="text-muted-foreground text-sm mt-1">Selecione um ou mais</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {HORARIOS.map(h => (
          <button
            key={h.id}
            onClick={() => toggleHorario(h.id)}
            className={`p-4 rounded-2xl border-2 text-center transition-all ${
              horarios.includes(h.id)
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="text-2xl mb-1">{h.icon}</div>
            <div className="font-display font-semibold text-sm">{h.label}</div>
            <div className="text-xs text-muted-foreground">{h.desc}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Matérias e subáreas
    <div key="materias" className="space-y-4">
      <div className="text-center mb-4">
        <BookOpen className="w-10 h-10 mx-auto mb-2 text-primary" />
        <h2 className="font-display font-bold text-2xl">O que quer estudar?</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Selecione as subáreas ({totalSubareas} selecionadas)
        </p>
      </div>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {AREAS.map(area => {
          const areaCount = (selectedSubareas[area.id] || []).length;
          const isExpanded = expandedArea === area.id;
          return (
            <div key={area.id} className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedArea(isExpanded ? null : area.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: area.cor }} />
                  <span className="font-display font-semibold">{area.label}</span>
                  {areaCount > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {areaCount}
                    </span>
                  )}
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5">
                  <button
                    onClick={() => selectAllSubareas(area)}
                    className="text-xs text-primary font-semibold mb-1"
                  >
                    {area.subareas.every(s => (selectedSubareas[area.id] || []).includes(s.id))
                      ? "Desmarcar todas"
                      : "Selecionar todas"}
                  </button>
                  {area.subareas.map(sub => {
                    const isSelected = (selectedSubareas[area.id] || []).includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggleSubarea(area.id, sub.id)}
                        className={`w-full text-left p-2.5 rounded-lg text-sm transition-all ${
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <span className="mr-2">{isSelected ? "✓" : "○"}</span>
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>,

    // Step 4: Confirmação
    <div key="confirmar" className="space-y-4 text-center">
      <Sparkles className="w-12 h-12 mx-auto text-primary" />
      <h2 className="font-display font-bold text-2xl">Tudo pronto! 🎉</h2>
      <p className="text-muted-foreground">
        Seu plano de estudos será gerado com base nas suas preferências.
      </p>
      <div className="bg-muted/50 rounded-xl p-4 text-left text-sm space-y-2">
        <div><strong>Objetivo:</strong> {OBJETIVOS.find(o => o.id === objetivo)?.label}</div>
        <div><strong>Frequência:</strong> {frequencia}x por semana</div>
        <div><strong>Horários:</strong> {horarios.map(h => HORARIOS.find(x => x.id === h)?.label).join(", ")}</div>
        <div><strong>Matérias:</strong> {totalSubareas} subáreas selecionadas</div>
      </div>
    </div>,
  ];

  const totalSteps = steps.length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" className="rounded-full" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          )}
          <Button
            variant="hero"
            className="rounded-full flex-1"
            disabled={!canProceed() || saving}
            onClick={() => {
              if (step < totalSteps - 1) setStep(step + 1);
              else handleFinish();
            }}
          >
            {saving ? "Salvando..." : step < totalSteps - 1 ? "Continuar" : "Começar a estudar 🚀"}
            {step < totalSteps - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
