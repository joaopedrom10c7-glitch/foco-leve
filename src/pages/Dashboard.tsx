import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Flame, Zap, Trophy, Star, Target, TrendingUp, BookOpen, Brain } from "lucide-react";

const AREAS = ["Linguagens", "Matemática", "Ciências Humanas", "Ciências da Natureza", "Redação"];

// XP thresholds per level
const XP_PER_LEVEL = 500;
const COGNITIVE_PROFILES: Record<string, { label: string; emoji: string; desc: string }> = {
  noturno: { label: "Estudante Noturno", emoji: "🌙", desc: "Você rende mais à noite" },
  maratonista: { label: "Maratonista", emoji: "🏃", desc: "Longas sessões são seu forte" },
  iniciante: { label: "Iniciante", emoji: "🌱", desc: "Construindo seu hábito" },
  constante: { label: "Constante", emoji: "🎯", desc: "Ritmo regular e sólido" },
  alta_performance: { label: "Alta Performance", emoji: "🚀", desc: "Acima da média!" },
};

const DAILY_MISSIONS = [
  { id: "study_30", label: "Estudar 30 minutos", xp: 50, icon: "📚" },
  { id: "flashcard_10", label: "Revisar 10 flashcards", xp: 30, icon: "🃏" },
  { id: "complete_session", label: "Completar 1 sessão", xp: 40, icon: "✅" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [cognitiveProfile, setCognitiveProfile] = useState("iniciante");
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    const [sessionsRes, profileRes, focusRes] = await Promise.all([
      supabase.from("study_sessions").select("*").eq("user_id", user.id).order("data", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("focus_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    const sessionsData = sessionsRes.data || [];
    setSessions(sessionsData);

    if (profileRes.data) {
      setProfile(profileRes.data);
      setXp(profileRes.data.xp_total || 0);
      setLevel(profileRes.data.level || 1);
      setCognitiveProfile(profileRes.data.cognitive_profile || "iniciante");
    }

    // Calculate streak
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (sessionsData.some((r: any) => r.data === dateStr)) s++;
      else break;
    }
    setStreak(s);

    // Today's minutes
    const todayStr = new Date().toISOString().split("T")[0];
    const todayMin = sessionsData.filter((s: any) => s.data === todayStr).reduce((a: number, s: any) => a + s.duracao_min, 0);
    setTodayMinutes(todayMin);

    // Check daily missions
    const missions: string[] = [];
    if (todayMin >= 30) missions.push("study_30");
    const todayFocus = (focusRes.data || []).filter((f: any) => f.created_at?.startsWith(todayStr) && f.completado);
    if (todayFocus.length >= 1) missions.push("complete_session");
    setCompletedMissions(missions);

    // Analyze cognitive profile
    analyzeCognitiveProfile(sessionsData);
  }, [user]);

  const analyzeCognitiveProfile = (data: any[]) => {
    if (data.length < 5) return;
    const nightSessions = data.filter(s => {
      const h = parseInt(s.created_at?.split("T")[1]?.split(":")[0] || "12");
      return h >= 20 || h <= 4;
    });
    const avgDuration = data.reduce((a, s) => a + s.duracao_min, 0) / data.length;
    const totalDays = new Set(data.map(s => s.data)).size;

    let profile = "iniciante";
    if (nightSessions.length > data.length * 0.6) profile = "noturno";
    else if (avgDuration > 45) profile = "maratonista";
    else if (totalDays > 14 && avgDuration > 20) profile = "constante";
    else if (totalDays > 20 && avgDuration > 30) profile = "alta_performance";

    if (profile !== cognitiveProfile && user) {
      setCognitiveProfile(profile);
      supabase.from("profiles").update({ cognitive_profile: profile }).eq("id", user.id);
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  // Charts
  const weekData = (() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const filtered = sessions.filter(s => new Date(s.data) >= weekAgo);
    const byMateria: Record<string, number> = {};
    filtered.forEach(s => { byMateria[s.materia] = (byMateria[s.materia] || 0) + s.duracao_min; });
    return Object.entries(byMateria).map(([name, minutos]) => ({ name, minutos }));
  })();

  const radarData = AREAS.map(area => {
    const total = sessions.filter(s => s.area === area).reduce((acc, s) => acc + s.duracao_min, 0);
    return { area, minutos: total };
  });

  const streakDays = (() => {
    const days: { date: string; studied: boolean }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({ date: dateStr, studied: sessions.some(s => s.data === dateStr) });
    }
    return days;
  })();

  const totalMin = sessions.reduce((a, s) => a + s.duracao_min, 0);
  const xpProgress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  const cogProfile = COGNITIVE_PROFILES[cognitiveProfile] || COGNITIVE_PROFILES.iniciante;

  // Next task from cronograma
  const [nextTask, setNextTask] = useState<any>(null);
  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const dia = now.getDay();
    const hora = `${now.getHours().toString().padStart(2, "0")}:00`;
    supabase.from("cronograma")
      .select("*")
      .eq("user_id", user.id)
      .eq("dia_semana", dia)
      .gte("horario", hora)
      .order("horario", { ascending: true })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setNextTask(data[0]); });
  }, [user]);

  if (!user) {
    return (
      <>
        <AppNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Faça login para ver seu dashboard.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-20">
        <div className="container py-6 space-y-5">

          {/* Action header — next task */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5"
          >
            {nextTask ? (
              <>
                <p className="text-xs text-muted-foreground mb-1">Próxima tarefa</p>
                <h2 className="font-display font-bold text-xl">{nextTask.materia}</h2>
                <p className="text-sm text-muted-foreground">{nextTask.conteudo} · {nextTask.horario}</p>
                <Button variant="hero" className="rounded-full mt-3 text-lg px-8 py-3 h-auto">
                  COMEÇAR AGORA 🚀
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Nenhuma tarefa agendada agora</p>
                <p className="font-display font-bold text-lg mt-1">Que tal uma sessão livre?</p>
                <Button variant="hero" className="rounded-full mt-3">
                  Estudar agora
                </Button>
              </>
            )}
          </motion.div>

          {/* XP + Level + Streak */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-4 text-center shadow-card">
              <Flame className="h-6 w-6 mx-auto text-orange-500 mb-1" />
              <p className="font-display font-bold text-2xl">{streak}</p>
              <p className="text-[10px] text-muted-foreground">dias de streak</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
              className="bg-card rounded-2xl p-4 text-center shadow-card">
              <Star className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
              <p className="font-display font-bold text-2xl">Lv.{level}</p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${xpProgress * 100}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-4 text-center shadow-card">
              <Zap className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="font-display font-bold text-2xl">{todayMinutes}m</p>
              <p className="text-[10px] text-muted-foreground">hoje</p>
            </motion.div>
          </div>

          {/* Cognitive profile */}
          <div className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-4">
            <div className="text-3xl">{cogProfile.emoji}</div>
            <div>
              <p className="font-display font-bold text-sm">{cogProfile.label}</p>
              <p className="text-xs text-muted-foreground">{cogProfile.desc}</p>
            </div>
            <Brain className="h-5 w-5 text-muted-foreground ml-auto" />
          </div>

          {/* Daily missions */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Missões do dia
            </h3>
            <div className="space-y-2">
              {DAILY_MISSIONS.map(m => {
                const done = completedMissions.includes(m.id);
                return (
                  <div key={m.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${done ? "bg-primary/10" : "bg-muted/30"}`}>
                    <span className="text-lg">{done ? "✅" : m.icon}</span>
                    <span className={`flex-1 text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{m.label}</span>
                    <span className="text-xs font-bold text-primary">+{m.xp} XP</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily progress bar */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-sm">Progresso diário</h3>
              <span className="text-xs text-muted-foreground">{Math.min(todayMinutes, 120)}/120 min</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-primary to-primary/70 rounded-full h-3"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((todayMinutes / 120) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Streak calendar */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-display font-bold text-sm mb-3">📅 Últimos 30 dias</h3>
            <div className="grid grid-cols-10 gap-1">
              {streakDays.map(d => (
                <div
                  key={d.date}
                  className="aspect-square rounded-sm transition-colors"
                  style={{
                    background: d.studied ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    opacity: d.studied ? 1 : 0.3,
                  }}
                  title={d.date}
                />
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Frequência semanal
            </h3>
            {weekData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="minutos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Estude para ver dados aqui!</p>
              </div>
            )}
          </div>

          {/* Radar */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-display font-bold text-sm mb-3">🎯 Equilíbrio entre áreas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} />
                <Radar dataKey="minutos" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
