import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { PenTool, Send, ArrowLeft, Clock, FileText, Sparkles, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TEMAS_ENEM = [
  { titulo: "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil", ano: "2023" },
  { titulo: "Desafios para a valorização de comunidades e povos tradicionais no Brasil", ano: "2022" },
  { titulo: "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil", ano: "2021" },
  { titulo: "O estigma associado às doenças mentais na sociedade brasileira", ano: "2020" },
  { titulo: "Democratização do acesso ao cinema no Brasil", ano: "2019" },
  { titulo: "Manipulação do comportamento do usuário pelo controle de dados na internet", ano: "2018" },
  { titulo: "Desafios para a formação educacional de surdos no Brasil", ano: "2017" },
  { titulo: "Caminhos para combater a intolerância religiosa no Brasil", ano: "2016" },
  { titulo: "A persistência da violência contra a mulher na sociedade brasileira", ano: "2015" },
  { titulo: "Desafios da mobilidade urbana sustentável no Brasil", ano: "2025 (previsto)" },
  { titulo: "O impacto da inteligência artificial no mercado de trabalho brasileiro", ano: "2025 (previsto)" },
  { titulo: "Saúde mental de jovens na era digital", ano: "2025 (previsto)" },
];

const DICAS = [
  "Introdução: Apresente o tema, tese e os 2 argumentos que vai desenvolver.",
  "Desenvolvimento 1: Repertório sociocultural + argumento + dados.",
  "Desenvolvimento 2: Segundo argumento com repertório diferente.",
  "Conclusão: Proposta de intervenção com agente, ação, meio, finalidade e detalhamento.",
  "Use conectivos: 'Ademais', 'Nesse sentido', 'Portanto', 'Sob essa ótica'.",
  "Evite: gerúndio excessivo, 1ª pessoa, linguagem informal.",
];

interface Submission {
  id: string;
  tema: string;
  texto: string;
  nota: number | null;
  feedback: string | null;
  created_at: string;
}

export default function RedacaoPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<"home" | "write" | "history" | "detail">("home");
  const [selectedTema, setSelectedTema] = useState("");
  const [texto, setTexto] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("redacao_submissions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setSubmissions((data || []) as Submission[]);
  }, [user]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const wordCount = texto.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = texto.split("\n").filter(l => l.trim()).length;

  const startWriting = (tema: string) => {
    setSelectedTema(tema);
    setTexto("");
    setTimer(0);
    setTimerActive(true);
    setView("write");
  };

  const submitRedacao = async () => {
    if (!user || !texto.trim()) return;
    setSubmitting(true);
    setTimerActive(false);

    try {
      // Get AI feedback via edge function
      const { data: aiRes } = await supabase.functions.invoke("ai-coach", {
        body: {
          message: `Avalie esta redação do ENEM sobre o tema "${selectedTema}". 
Dê uma nota de 0 a 1000 (baseada nas 5 competências do ENEM: domínio da norma culta, compreensão do tema, argumentação, coesão, proposta de intervenção).
Forneça feedback detalhado por competência.

Redação:
${texto}`,
          context: { type: "redacao_feedback" },
        },
      });

      const feedback = aiRes?.reply || "Feedback indisponível no momento.";
      // Extract score from AI response
      const scoreMatch = feedback.match(/(\d{2,4})\s*(?:pontos|\/1000|nota)/i);
      const nota = scoreMatch ? Math.min(parseInt(scoreMatch[1]), 1000) : null;

      await supabase.from("redacao_submissions").insert({
        user_id: user.id,
        tema: selectedTema,
        texto,
        nota,
        feedback,
      });

      toast({ title: "Redação enviada! ✍️", description: nota ? `Nota estimada: ${nota}/1000` : "Feedback gerado com sucesso." });
      loadHistory();
      setView("home");
    } catch {
      toast({ title: "Erro ao enviar", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <><AppNav /><div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Faça login para praticar redação.</p></div></>;
  }

  if (view === "detail" && selectedSub) {
    return (
      <><AppNav /><div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-2xl space-y-4">
          <button onClick={() => setView("history")} className="flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Voltar</button>
          <div>
            <h2 className="font-display font-bold text-lg">{selectedSub.tema}</h2>
            <p className="text-xs text-muted-foreground">{new Date(selectedSub.created_at).toLocaleDateString("pt-BR")}</p>
            {selectedSub.nota && <p className="text-primary font-bold text-2xl mt-2">{selectedSub.nota}/1000</p>}
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-display font-bold text-sm mb-2">Sua Redação</h3>
            <p className="text-sm whitespace-pre-wrap">{selectedSub.texto}</p>
          </div>
          {selectedSub.feedback && (
            <div className="bg-card rounded-2xl p-4 shadow-card border border-primary/20">
              <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Feedback da IA</h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{selectedSub.feedback}</p>
            </div>
          )}
        </div>
      </div></>
    );
  }

  if (view === "write") {
    return (
      <><AppNav /><div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-2xl space-y-4">
          <button onClick={() => { setView("home"); setTimerActive(false); }} className="flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Voltar</button>
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <p className="text-xs text-muted-foreground mb-1">Tema</p>
            <h2 className="font-display font-bold text-lg">{selectedTema}</h2>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /> {formatTime(timer)}</span>
            <span className="text-muted-foreground">{wordCount} palavras · {lineCount} linhas</span>
          </div>

          <div className="bg-card rounded-xl p-3 shadow-card">
            <p className="text-xs text-primary font-bold mb-1">💡 Dica</p>
            <p className="text-xs text-muted-foreground">{DICAS[Math.min(Math.floor(lineCount / 5), DICAS.length - 1)]}</p>
          </div>

          <Textarea
            className="min-h-[400px] text-sm leading-relaxed"
            placeholder="Escreva sua redação aqui... (mínimo 7 linhas, ~500 palavras)"
            value={texto}
            onChange={e => setTexto(e.target.value)}
          />

          <Button variant="hero" className="w-full rounded-full" onClick={submitRedacao} disabled={submitting || wordCount < 50}>
            {submitting ? "Analisando com IA..." : <><Send className="h-4 w-4 mr-2" /> Enviar para correção</>}
          </Button>

          {wordCount < 50 && <p className="text-center text-xs text-muted-foreground">Mínimo de 50 palavras para enviar</p>}
        </div>
      </div></>
    );
  }

  if (view === "history") {
    return (
      <><AppNav /><div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-lg space-y-4">
          <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Voltar</button>
          <h2 className="font-display font-bold text-xl">Histórico de Redações</h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma redação enviada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl p-4 shadow-card cursor-pointer hover:-translate-y-0.5 transition-transform"
                  onClick={() => { setSelectedSub(s); setView("detail"); }}
                >
                  <p className="font-display font-bold text-sm">{s.tema}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString("pt-BR")}</span>
                    {s.nota && <span className="text-xs font-bold text-primary">{s.nota}/1000</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div></>
    );
  }

  // HOME VIEW
  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-lg space-y-5">
          <div>
            <h1 className="font-display font-bold text-2xl flex items-center gap-2"><PenTool className="h-6 w-6 text-primary" /> Redação ENEM</h1>
            <p className="text-sm text-muted-foreground">Pratique com temas reais e receba feedback com IA</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setView("history")}>
              <FileText className="h-4 w-4 mr-1" /> Histórico ({submissions.length})
            </Button>
          </div>

          {/* Tips card */}
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <h3 className="font-display font-bold text-sm mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Estrutura ideal</h3>
            <div className="space-y-1.5">
              {["Introdução: tema + tese + 2 argumentos", "D1: Repertório + argumento 1", "D2: Repertório + argumento 2", "Conclusão: Proposta de intervenção completa"].map((t, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {t}
                </p>
              ))}
            </div>
          </div>

          {/* Themes */}
          <h3 className="font-display font-bold text-sm">Escolha um tema</h3>
          <div className="space-y-2">
            {TEMAS_ENEM.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-4 shadow-card cursor-pointer hover:-translate-y-0.5 transition-transform"
                onClick={() => startWriting(t.titulo)}
              >
                <p className="font-semibold text-sm">{t.titulo}</p>
                <p className="text-xs text-muted-foreground mt-0.5">ENEM {t.ano}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
