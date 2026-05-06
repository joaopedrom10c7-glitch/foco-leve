import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { User, Flame, Zap, Trophy, BookOpen, Target, Shield, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ sessions: 0, minutes: 0, flashcards: 0, answers: 0, accuracy: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, sessionsRes, cardsRes, answersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("study_sessions").select("id, duracao_min").eq("user_id", user.id),
        supabase.from("flashcards").select("id").eq("user_id", user.id),
        supabase.from("user_answers").select("correto").eq("user_id", user.id),
      ]);
      const p = profileRes.data;
      if (p) {
        setProfile(p);
        setNome(p.nome || "");
      }
      const sessions = sessionsRes.data || [];
      const answers = answersRes.data || [];
      const correct = answers.filter((a: any) => a.correto).length;
      setStats({
        sessions: sessions.length,
        minutes: sessions.reduce((acc: number, s: any) => acc + (s.duracao_min || 0), 0),
        flashcards: cardsRes.data?.length || 0,
        answers: answers.length,
        accuracy: answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0,
      });
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ nome }).eq("id", user.id);
    setSaving(false);
    toast({ title: "Perfil salvo! ✅" });
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <div className="container py-20 text-center text-muted-foreground">Faça login para ver seu perfil</div>
      </div>
    );
  }

  const statCards = [
    { icon: BookOpen, label: "Sessões", value: stats.sessions, color: "text-primary" },
    { icon: Zap, label: "XP Total", value: profile.xp_total || 0, color: "text-accent" },
    { icon: Flame, label: "Streak", value: `${profile.streak_dias || 0} dias`, color: "text-warning" },
    { icon: Trophy, label: "Nível", value: profile.level || 1, color: "text-info" },
    { icon: Target, label: "Acurácia", value: `${stats.accuracy}%`, color: "text-primary" },
    { icon: BookOpen, label: "Flashcards", value: stats.flashcards, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <AppNav />
      <div className="container py-6 max-w-lg space-y-6">
        {/* Avatar & name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-card p-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-primary mx-auto flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-primary-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            Nível {profile.level || 1} · {profile.cognitive_profile || "Iniciante"}
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block text-left mb-1">Nome</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
            </div>
            <Button variant="hero" onClick={handleSave} disabled={saving} className="w-full gap-2 rounded-xl">
              <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl shadow-card p-4 text-center"
            >
              <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
              <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Study time */}
        <div className="bg-card rounded-2xl shadow-card p-5">
          <h3 className="font-display font-bold text-foreground mb-2">📊 Resumo</h3>
          <p className="text-sm text-muted-foreground">
            Tempo total estudado: <span className="text-foreground font-semibold">{Math.floor(stats.minutes / 60)}h {stats.minutes % 60}m</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Questões respondidas: <span className="text-foreground font-semibold">{stats.answers}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Último estudo: <span className="text-foreground font-semibold">{profile.ultimo_estudo || "Nunca"}</span>
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-card rounded-2xl shadow-card p-5 border border-destructive/20">
          <h3 className="font-display font-bold text-destructive mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" /> Conta
          </h3>
          <Button variant="outline" onClick={signOut} className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}
