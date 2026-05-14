import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ChevronRight, Calendar, Download, BookOpen, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AREAS = [
  { key: "linguagens", label: "Linguagens", emoji: "📝" },
  { key: "matematica", label: "Matemática", emoji: "📐" },
  { key: "natureza", label: "Ciências da Natureza", emoji: "🔬" },
  { key: "humanas", label: "Ciências Humanas", emoji: "🌍" },
  { key: "redacao", label: "Redação", emoji: "📖" },
];

const CONTENTS: Record<string, string[]> = {
  linguagens: ["Interpretação", "Gramática aplicada", "Figuras de linguagem", "Literatura"],
  matematica: ["Porcentagem", "Funções", "Estatística", "Geometria plana", "Geometria espacial", "Probabilidade"],
  natureza: ["Citologia", "Ecologia", "Genética", "Cinemática", "Dinâmica", "Termologia", "Estequiometria", "Orgânica"],
  humanas: ["História do Brasil", "História geral", "Geografia física", "Geopolítica", "Filosofia", "Sociologia"],
  redacao: ["Estrutura dissertativa", "Repertório sociocultural", "Argumentação", "Propostas de intervenção"],
};

const DAYS_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const STUDY_TYPES = ["Teoria", "Questões ENEM", "Flashcards", "Revisão ativa", "Revisão geral"];

interface DiagnosticData {
  name: string;
  objective: string;
  daysPerWeek: number;
  sessionTime: string;
  schedule: string;
  level: string;
}

interface ScheduleEntry {
  day: string;
  subject: string;
  content: string;
  type: string;
  time: string;
}

type Step = "name" | "objective" | "days" | "time" | "schedule" | "level" | "areas" | "contents" | "result";

export default function StudyPlanner({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("name");
  const [data, setData] = useState<DiagnosticData>({ name: "", objective: "", daysPerWeek: 3, sessionTime: "40min", schedule: "Tarde", level: "Médio" });
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [selectedContents, setSelectedContents] = useState<Record<string, Set<string>>>({});
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleEntry[]>([]);
  const [savingPlan, setSavingPlan] = useState(false);

  const toggleArea = (key: string) => {
    const s = new Set(selectedAreas);
    s.has(key) ? s.delete(key) : s.add(key);
    setSelectedAreas(s);
  };

  const toggleContent = (area: string, content: string) => {
    const sc = { ...selectedContents };
    if (!sc[area]) sc[area] = new Set();
    const s = new Set(sc[area]);
    s.has(content) ? s.delete(content) : s.add(content);
    sc[area] = s;
    setSelectedContents(sc);
  };

  const generateSchedule = () => {
    const areas = selectedAreas.size > 0 ? Array.from(selectedAreas) : ["matematica", "linguagens", "natureza", "humanas"];
    const entries: ScheduleEntry[] = [];
    const days = DAYS_LABELS.slice(0, data.daysPerWeek);
    const timeMin = data.sessionTime === "20min" ? "20min" : data.sessionTime === "40min" ? "40min" : data.sessionTime === "1h" ? "60min" : "90min";

    days.forEach((day, i) => {
      const areaKey = areas[i % areas.length];
      const areaLabel = AREAS.find(a => a.key === areaKey)?.label || areaKey;
      const contents = selectedContents[areaKey]?.size
        ? Array.from(selectedContents[areaKey])
        : CONTENTS[areaKey] || ["Conteúdo geral"];
      const content = contents[i % contents.length];
      const type = STUDY_TYPES[i % STUDY_TYPES.length];

      entries.push({ day, subject: areaLabel, content, type, time: timeMin });

      // Add review on last day
      if (i === days.length - 1) {
        entries.push({ day, subject: "Revisão", content: "Revisão geral leve", type: "Revisão geral", time: "30min" });
      }
    });

    setGeneratedSchedule(entries);
    setStep("result");
  };

  const downloadPDF = () => {
    // Simple text-based download (no external deps)
    let text = `CRONOGRAMA FOCO LEVE\n`;
    text += `Aluno: ${data.name}\n`;
    text += `Objetivo: ${data.objective}\n`;
    text += `Horário preferido: ${data.schedule}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    let currentDay = "";
    generatedSchedule.forEach(e => {
      if (e.day !== currentDay) {
        currentDay = e.day;
        text += `📅 ${e.day.toUpperCase()}\n`;
      }
      text += `  • ${e.subject} — ${e.content} (${e.time})\n`;
      text += `    Tipo: ${e.type}\n`;
    });

    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `\n💪 "Constância supera intensidade. Vai com calma, mas vai."\n`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cronograma-${data.name.toLowerCase().replace(/\s/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Map day label -> dia_semana (0=Dom..6=Sáb)
  const dayToNum: Record<string, number> = {
    "Domingo": 0, "Segunda": 1, "Terça": 2, "Quarta": 3, "Quinta": 4, "Sexta": 5, "Sábado": 6,
  };
  const scheduleToHora: Record<string, string> = {
    "Manhã": "08:00", "Tarde": "14:00", "Noite": "19:00", "Madrugada": "23:00",
  };
  const sessionToMin: Record<string, number> = { "20min": 20, "40min": 40, "1h": 60, "2h+": 120 };
  const CORES_AREA: Record<string, string> = {
    "Linguagens": "hsl(210 80% 55%)",
    "Matemática": "hsl(15 85% 60%)",
    "Ciências Humanas": "hsl(40 90% 55%)",
    "Ciências da Natureza": "hsl(145 60% 45%)",
    "Redação": "hsl(280 60% 55%)",
    "Revisão": "hsl(165 55% 42%)",
  };

  const saveToWeekly = async () => {
    if (!user) {
      toast({ title: "Faça login para salvar no cronograma", variant: "destructive" });
      return;
    }
    setSavingPlan(true);
    const baseHora = scheduleToHora[data.schedule] || "14:00";
    const baseHourNum = parseInt(baseHora.split(":")[0]);
    const dur = sessionToMin[data.sessionTime] || 60;

    // Clear existing rows for these slots before inserting new
    const inserts = generatedSchedule.map((e, idx) => {
      const dia = dayToNum[e.day] ?? 1;
      // stagger if same day has multiple entries
      const sameDayBefore = generatedSchedule.slice(0, idx).filter(p => p.day === e.day).length;
      const hour = (baseHourNum + sameDayBefore) % 24;
      const horario = `${hour.toString().padStart(2, "0")}:00`;
      const cor = CORES_AREA[e.subject] || "hsl(165 55% 42%)";
      return {
        user_id: user.id,
        dia_semana: dia,
        horario,
        materia: e.subject,
        conteudo: e.content,
        tipo_estudo: e.type.toLowerCase().includes("revis") ? "revisao" : e.type.toLowerCase().includes("quest") ? "exercicios" : "leitura",
        duracao: dur,
        cor,
      };
    });

    const { error } = await supabase.from("cronograma").insert(inserts);
    setSavingPlan(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cronograma salvo! ✓", description: "Veja na planilha semanal." });
      setTimeout(() => navigate("/cronograma"), 800);
    }
  };

  const renderStep = () => {
    switch (step) {
      case "name":
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-2xl text-foreground mb-2">Como você se chama? 😊</h2>
            <Input
              placeholder="Seu nome"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
              className="mb-4 text-center text-lg rounded-xl"
              maxLength={50}
            />
            <Button variant="hero" size="lg" disabled={!data.name.trim()} onClick={() => setStep("objective")} className="rounded-full w-full gap-2">
              Continuar <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        );
      case "objective":
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-2xl text-foreground mb-2">Qual seu objetivo, {data.name}?</h2>
            <div className="flex flex-col gap-3 mb-4">
              {["Passar", "Melhorar nota", "Alta performance"].map(o => (
                <button
                  key={o}
                  onClick={() => { setData({ ...data, objective: o }); setStep("days"); }}
                  className={`rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-1 active:scale-95 ${
                    data.objective === o ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <span className="font-display font-bold text-base text-foreground">{o}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case "days":
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-2xl text-foreground mb-2">Quantos dias por semana?</h2>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <button
                  key={d}
                  onClick={() => { setData({ ...data, daysPerWeek: d }); setStep("time"); }}
                  className={`w-12 h-12 rounded-full font-display font-bold text-lg transition-all ${
                    data.daysPerWeek === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        );
      case "time":
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-2xl text-foreground mb-2">Tempo por sessão?</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {["20min", "40min", "1h", "2h+"].map(t => (
                <button
                  key={t}
                  onClick={() => { setData({ ...data, sessionTime: t }); setStep("schedule"); }}
                  className={`rounded-xl border-2 p-4 text-center transition-all hover:-translate-y-1 ${
                    data.sessionTime === t ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <span className="font-display font-bold text-xl text-foreground">{t}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case "schedule":
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-2xl text-foreground mb-2">Melhor horário?</h2>
            <div className="flex flex-col gap-3 mb-4">
              {["Manhã", "Tarde", "Noite", "Madrugada"].map(s => (
                <button
                  key={s}
                  onClick={() => { setData({ ...data, schedule: s }); setStep("level"); }}
                  className={`rounded-xl border-2 p-4 text-center transition-all hover:-translate-y-1 ${
                    data.schedule === s ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <span className="font-display font-bold">{s}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case "level":
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-2xl text-foreground mb-2">Seu nível geral?</h2>
            <div className="flex flex-col gap-3 mb-4">
              {["Iniciante", "Médio", "Avançado"].map(l => (
                <button
                  key={l}
                  onClick={() => { setData({ ...data, level: l }); setStep("areas"); }}
                  className={`rounded-xl border-2 p-4 text-center transition-all hover:-translate-y-1 ${
                    data.level === l ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <span className="font-display font-bold">{l}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case "areas":
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-2xl text-foreground mb-2">Quais áreas estudar?</h2>
            <p className="text-muted-foreground text-xs mb-4">Selecione uma ou mais. Ou pule para cronograma automático.</p>
            <div className="flex flex-col gap-2 mb-4">
              {AREAS.map(a => (
                <button
                  key={a.key}
                  onClick={() => toggleArea(a.key)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    selectedAreas.has(a.key) ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="font-display font-bold text-foreground">{a.label}</span>
                  {selectedAreas.has(a.key) && <span className="ml-auto text-primary">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("contents")} disabled={selectedAreas.size === 0} className="flex-1">
                Escolher conteúdos
              </Button>
              <Button variant="hero" onClick={generateSchedule} className="flex-1 rounded-full gap-2">
                Gerar cronograma <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case "contents":
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-xl text-foreground mb-4">Conteúdos específicos</h2>
            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto">
              {Array.from(selectedAreas).map(areaKey => {
                const area = AREAS.find(a => a.key === areaKey);
                return (
                  <div key={areaKey}>
                    <p className="font-display font-bold text-sm text-foreground mb-2">{area?.emoji} {area?.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {(CONTENTS[areaKey] || []).map(c => (
                        <button
                          key={c}
                          onClick={() => toggleContent(areaKey, c)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            selectedContents[areaKey]?.has(c) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="hero" onClick={generateSchedule} className="w-full rounded-full gap-2">
              Gerar cronograma <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        );
      case "result":
        let currentDay = "";
        return (
          <div className="animate-fade-in">
            <h2 className="font-display font-800 text-2xl text-foreground mb-1">Seu Cronograma 📅</h2>
            <p className="text-muted-foreground text-xs mb-4">{data.name} • {data.objective} • {data.daysPerWeek}x/semana</p>
            <div className="space-y-2 mb-6">
              {generatedSchedule.map((e, i) => {
                const showDay = e.day !== currentDay;
                if (showDay) currentDay = e.day;
                return (
                  <div key={i}>
                    {showDay && (
                      <p className="font-display font-bold text-sm text-primary mt-3 mb-1">📅 {e.day}</p>
                    )}
                    <div className="bg-card rounded-xl p-3 border border-border">
                      <p className="font-display font-bold text-sm text-foreground">{e.subject} — {e.content}</p>
                      <p className="text-xs text-muted-foreground">{e.type} • {e.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground italic mb-4 text-center">
              "Constância supera intensidade. Vai com calma, mas vai." 💪
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" onClick={saveToWeekly} disabled={savingPlan} className="rounded-full gap-2">
                {savingPlan ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {savingPlan ? "Salvando..." : "Salvar na planilha semanal"}
              </Button>
              <Button variant="calm" size="lg" onClick={downloadPDF} className="rounded-full gap-2">
                <Download className="h-5 w-5" /> Baixar como texto
              </Button>
              <Button variant="ghost" onClick={onBack}>Voltar ao início</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="min-h-[100dvh] flex flex-col bg-background">
      <div className="container py-4">
        <Button variant="ghost" size="sm" onClick={step === "name" ? onBack : () => {
          const steps: Step[] = ["name", "objective", "days", "time", "schedule", "level", "areas", "contents", "result"];
          const idx = steps.indexOf(step);
          if (idx > 0) setStep(steps[idx - 1]);
        }} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
      <div className="flex-1 container flex flex-col items-center justify-center px-6 pb-12 max-w-md">
        <BookOpen className="h-10 w-10 text-primary mb-4" />
        {renderStep()}
      </div>
    </section>
  );
}
