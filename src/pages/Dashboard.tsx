import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const AREAS = ["Linguagens", "Matemática", "Ciências Humanas", "Ciências da Natureza", "Redação"];
const AREA_COLORS: Record<string, string> = {
  "Linguagens": "#3B82F6",
  "Matemática": "#EF6C35",
  "Ciências Humanas": "#F59E0B",
  "Ciências da Natureza": "#10B981",
  "Redação": "#8B5CF6",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("data", { ascending: false });
      if (data) {
        setSessions(data);
        // Calculate streak
        let s = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          if (data.some((r: any) => r.data === dateStr)) s++;
          else break;
        }
        setStreak(s);
      }
    };
    load();
  }, [user]);

  // Bar chart: weekly by materia
  const weekData = (() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const filtered = sessions.filter(s => new Date(s.data) >= weekAgo);
    const byMateria: Record<string, number> = {};
    filtered.forEach(s => {
      byMateria[s.materia] = (byMateria[s.materia] || 0) + s.duracao_min;
    });
    return Object.entries(byMateria).map(([name, minutos]) => ({ name, minutos }));
  })();

  // Radar chart: balance by area
  const radarData = AREAS.map(area => {
    const total = sessions.filter(s => s.area === area).reduce((acc, s) => acc + s.duracao_min, 0);
    return { area, minutos: total };
  });

  // Streak calendar (last 30 days)
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
  const totalSessions = sessions.length;

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
        <div className="container py-6 space-y-6">
          <div>
            <h1 className="font-display font-bold text-2xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Seus dados de estudo em tempo real</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Streak", value: `${streak} dias`, emoji: "🔥" },
              { label: "Total", value: `${Math.round(totalMin / 60)}h ${totalMin % 60}m`, emoji: "⏱️" },
              { label: "Sessões", value: totalSessions.toString(), emoji: "📚" },
            ].map(s => (
              <div key={s.label} className="bg-card rounded-2xl p-4 text-center shadow-card">
                <p className="text-2xl mb-1">{s.emoji}</p>
                <p className="font-display font-bold text-xl">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
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
            <h3 className="font-display font-bold text-sm mb-3">📊 Frequência semanal por matéria</h3>
            {weekData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="minutos" fill="hsl(165, 55%, 42%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Estude para ver dados aqui!</p>
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
                <Radar dataKey="minutos" stroke="hsl(165, 55%, 42%)" fill="hsl(165, 55%, 42%)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
