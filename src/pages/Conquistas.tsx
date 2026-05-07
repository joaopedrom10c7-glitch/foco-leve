import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";

interface Achievement {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  tipo: string;
  meta: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export default function ConquistasPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState({ sessions: 0, streak: 0, xp: 0, simulados: 0, redacoes: 0, flashcards: 0 });

  const load = useCallback(async () => {
    if (!user) return;
    const [achRes, unlRes, sessRes, profRes, answersRes, redacaoRes, fcRes] = await Promise.all([
      supabase.from("achievements").select("*"),
      supabase.from("user_achievements").select("*").eq("user_id", user.id),
      supabase.from("study_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("profiles").select("xp_total, streak_dias").eq("id", user.id).single(),
      supabase.from("user_answers").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("redacao_submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setAchievements((achRes.data || []) as Achievement[]);
    setUnlocked((unlRes.data || []) as UserAchievement[]);
    setStats({
      sessions: sessRes.count || 0,
      streak: profRes.data?.streak_dias || 0,
      xp: profRes.data?.xp_total || 0,
      simulados: answersRes.count || 0,
      redacoes: redacaoRes.count || 0,
      flashcards: fcRes.count || 0,
    });

    // Auto-unlock achievements
    const allAch = (achRes.data || []) as Achievement[];
    const existing = new Set((unlRes.data || []).map((u: any) => u.achievement_id));
    for (const a of allAch) {
      if (existing.has(a.id)) continue;
      let progress = 0;
      if (a.tipo === "sessions") progress = sessRes.count || 0;
      else if (a.tipo === "streak") progress = profRes.data?.streak_dias || 0;
      else if (a.tipo === "xp") progress = profRes.data?.xp_total || 0;
      else if (a.tipo === "simulado") progress = answersRes.count || 0;
      else if (a.tipo === "redacao") progress = redacaoRes.count || 0;
      else if (a.tipo === "flashcard") progress = fcRes.count || 0;
      if (progress >= a.meta) {
        await supabase.from("user_achievements").insert({ user_id: user.id, achievement_id: a.id });
        existing.add(a.id);
      }
    }
    // Reload unlocked
    const { data: freshUnlocked } = await supabase.from("user_achievements").select("*").eq("user_id", user.id);
    setUnlocked((freshUnlocked || []) as UserAchievement[]);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unlockedIds = new Set(unlocked.map(u => u.achievement_id));
  const unlockedCount = unlocked.length;
  const totalCount = achievements.length;

  const getProgress = (a: Achievement) => {
    if (a.tipo === "sessions") return Math.min(stats.sessions, a.meta);
    if (a.tipo === "streak") return Math.min(stats.streak, a.meta);
    if (a.tipo === "xp") return Math.min(stats.xp, a.meta);
    if (a.tipo === "simulado") return Math.min(stats.simulados, a.meta);
    if (a.tipo === "redacao") return Math.min(stats.redacoes, a.meta);
    if (a.tipo === "flashcard") return Math.min(stats.flashcards, a.meta);
    return 0;
  };

  if (!user) {
    return <><AppNav /><div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Faça login para ver conquistas.</p></div></>;
  }

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-lg space-y-5">
          <div>
            <h1 className="font-display font-bold text-2xl flex items-center gap-2"><Trophy className="h-6 w-6 text-primary" /> Conquistas</h1>
            <p className="text-sm text-muted-foreground">{unlockedCount}/{totalCount} desbloqueadas</p>
          </div>

          <div className="w-full bg-muted rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-primary to-yellow-500 rounded-full h-3"
              initial={{ width: 0 }}
              animate={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          <div className="space-y-3">
            {achievements.map((a, i) => {
              const done = unlockedIds.has(a.id);
              const progress = getProgress(a);
              const pct = Math.min((progress / a.meta) * 100, 100);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-2xl p-4 shadow-card flex items-center gap-4 transition-all ${done ? "border border-primary/30" : "opacity-70"}`}
                >
                  <div className="text-3xl">{done ? a.icone : <Lock className="h-7 w-7 text-muted-foreground" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm">{a.nome}</p>
                    <p className="text-xs text-muted-foreground">{a.descricao}</p>
                    {!done && (
                      <div className="mt-1.5">
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div className="bg-primary/50 rounded-full h-1.5 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{progress}/{a.meta}</p>
                      </div>
                    )}
                  </div>
                  {done && <span className="text-xs text-primary font-bold">✓</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
