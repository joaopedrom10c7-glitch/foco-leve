import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Trophy, Flame, Crown, Medal } from "lucide-react";
import { motion } from "framer-motion";

interface RankRow {
  id: string;
  apelido: string | null;
  nome: string | null;
  level: number | null;
  xp_total: number | null;
  streak_dias: number | null;
}

export default function Ranking() {
  const { user } = useAuth();
  const [rows, setRows] = useState<RankRow[]>([]);
  const [tab, setTab] = useState<"xp" | "streak">("xp");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const orderCol = tab === "xp" ? "xp_total" : "streak_dias";
      const { data } = await supabase
        .from("profiles")
        .select("id, apelido, nome, level, xp_total, streak_dias")
        .eq("publico", true)
        .order(orderCol, { ascending: false, nullsFirst: false })
        .limit(50);
      setRows(data || []);
      setLoading(false);
    };
    load();
  }, [tab]);

  const medal = (i: number) => {
    if (i === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (i === 1) return <Medal className="h-5 w-5 text-slate-400" />;
    if (i === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNav />
      <div className="container max-w-3xl py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">Ranking da Comunidade</h1>
            <p className="text-muted-foreground text-sm">Veja quem está mandando bem na preparação</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("xp")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "xp" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <Trophy className="inline h-4 w-4 mr-1" /> Por XP
          </button>
          <button
            onClick={() => setTab("streak")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "streak" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <Flame className="inline h-4 w-4 mr-1" /> Por Streak
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando ranking...</div>
        ) : rows.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Nenhum aluno no ranking ainda. Seja o primeiro!
          </Card>
        ) : (
          <div className="space-y-2">
            {rows.map((r, i) => {
              const isMe = r.id === user?.id;
              const value = tab === "xp" ? `${r.xp_total || 0} XP` : `${r.streak_dias || 0} dias`;
              const name = r.apelido || r.nome || "Anônimo";
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card
                    className={`p-4 flex items-center gap-4 ${
                      isMe ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="w-8 flex justify-center">{medal(i)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold truncate">{name}</span>
                        {isMe && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Nível {r.level || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{value}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
