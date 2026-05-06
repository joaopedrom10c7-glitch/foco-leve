import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Clock, Target, BookOpen, Brain, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--info))", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");

  const loadData = useCallback(async () => {
    if (!user) return;
    const [s, a] = await Promise.all([
      supabase.from("study_sessions").select("*").eq("user_id", user.id).order("data", { ascending: true }),
      supabase.from("user_answers").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    ]);
    setSessions(s.data || []);
    setAnswers(a.data || []);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const now = new Date();
  const filterDate = period === "7d" ? new Date(now.getTime() - 7 * 86400000)
    : period === "30d" ? new Date(now.getTime() - 30 * 86400000) : new Date(0);

  const filteredSessions = sessions.filter(s => new Date(s.data || s.created_at) >= filterDate);
  const filteredAnswers = answers.filter(a => new Date(a.created_at) >= filterDate);

  const totalMinutes = filteredSessions.reduce((acc, s) => acc + (s.duracao_min || 0), 0);
  const totalSessions = filteredSessions.length;
  const correctCount = filteredAnswers.filter(a => a.correto).length;
  const accuracy = filteredAnswers.length > 0 ? Math.round((correctCount / filteredAnswers.length) * 100) : 0;

  // Daily study chart
  const dailyMap = new Map<string, number>();
  filteredSessions.forEach(s => {
    const day = (s.data || s.created_at?.split("T")[0]) as string;
    dailyMap.set(day, (dailyMap.get(day) || 0) + (s.duracao_min || 0));
  });
  const dailyData = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([day, min]) => ({ day: day.slice(5), minutos: min }));

  // Subject distribution
  const subjectMap = new Map<string, number>();
  filteredSessions.forEach(s => {
    subjectMap.set(s.materia, (subjectMap.get(s.materia) || 0) + (s.duracao_min || 0));
  });
  const subjectData = Array.from(subjectMap.entries()).map(([name, value]) => ({ name, value }));

  // Accuracy by subject
  const accMap = new Map<string, { correct: number; total: number }>();
  filteredAnswers.forEach(a => {
    const entry = accMap.get(a.materia) || { correct: 0, total: 0 };
    entry.total++;
    if (a.correto) entry.correct++;
    accMap.set(a.materia, entry);
  });
  const accData = Array.from(accMap.entries()).map(([materia, v]) => ({
    materia,
    acerto: Math.round((v.correct / v.total) * 100),
    total: v.total,
  }));

  const stats = [
    { icon: Clock, label: "Tempo Total", value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, color: "text-primary" },
    { icon: BookOpen, label: "Sessões", value: totalSessions.toString(), color: "text-accent" },
    { icon: Target, label: "Acurácia", value: `${accuracy}%`, color: "text-info" },
    { icon: Brain, label: "Questões", value: filteredAnswers.length.toString(), color: "text-warning" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <AppNav />
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-foreground">Análise de Desempenho</h1>
            <p className="text-sm text-muted-foreground">Acompanhe sua evolução no ENEM</p>
          </div>
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {(["7d", "30d", "all"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "Tudo"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl shadow-card p-4"
            >
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Daily study chart */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Minutos por dia
          </h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                />
                <Bar dataKey="minutos" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10 text-sm">Nenhuma sessão neste período</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Subject distribution */}
          <div className="bg-card rounded-2xl shadow-card p-5">
            <h3 className="font-display font-bold text-foreground mb-4">📚 Distribuição por Matéria</h3>
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {subjectData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10 text-sm">Sem dados</p>
            )}
          </div>

          {/* Accuracy by subject */}
          <div className="bg-card rounded-2xl shadow-card p-5">
            <h3 className="font-display font-bold text-foreground mb-4">🎯 Acerto por Matéria</h3>
            {accData.length > 0 ? (
              <div className="space-y-3">
                {accData.map((d, i) => (
                  <div key={d.materia}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{d.materia}</span>
                      <span className="text-muted-foreground">{d.acerto}% ({d.total} questões)</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.acerto}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10 text-sm">Faça simulados para ver dados</p>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-display font-bold text-foreground mb-3">💡 Insights</h3>
          <div className="space-y-2">
            {totalMinutes > 0 && (
              <p className="text-sm text-muted-foreground">
                📊 Média diária: <span className="text-foreground font-semibold">
                  {Math.round(totalMinutes / Math.max(dailyMap.size, 1))} min/dia
                </span>
              </p>
            )}
            {accData.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground">
                  ✅ Melhor matéria: <span className="text-foreground font-semibold">
                    {accData.sort((a, b) => b.acerto - a.acerto)[0]?.materia}
                  </span>
                </p>
                {accData.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Precisa melhorar: <span className="text-foreground font-semibold">
                      {accData.sort((a, b) => a.acerto - b.acerto)[0]?.materia}
                    </span>
                  </p>
                )}
              </>
            )}
            {totalSessions === 0 && (
              <p className="text-sm text-muted-foreground">🚀 Comece uma sessão de estudo para gerar insights!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
