import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppNav from "@/components/AppNav";
import Editor from "@/components/redacao/Editor";
import Sidebar from "@/components/redacao/Sidebar";
import Toolbar from "@/components/redacao/Toolbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCorretor } from "@/hooks/useCorretor";
import { supabase } from "@/integrations/supabase/client";
import { addPersonalWord } from "@/services/redacao/Dictionary";
import type { Issue } from "@/services/redacao/types";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, FileText, Loader2, PenTool } from "lucide-react";

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
  { titulo: "Desafios da mobilidade urbana sustentável no Brasil", ano: "Tema livre" },
  { titulo: "O impacto da automação no mercado de trabalho brasileiro", ano: "Tema livre" },
  { titulo: "Saúde mental de jovens na era digital", ano: "Tema livre" },
];

interface Submission {
  id: string;
  tema: string;
  texto: string;
  nota: number | null;
  feedback: string | null;
  created_at: string;
}

const DRAFT_KEY = "focoleve:redacao-rascunho";

export default function RedacaoPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<"home" | "write" | "history" | "detail">("home");
  const [selectedTema, setSelectedTema] = useState("");
  const [texto, setTexto] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [ignored, setIgnored] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const bump = useRef(0);
  const [, forceUpdate] = useState(0);

  const { issues: rawIssues, stats, enem, dictReady, analyzing } = useCorretor(texto);
  const issues = useMemo(
    () => rawIssues.filter((i) => !ignored.includes(i.id)),
    [rawIssues, ignored],
  );

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("redacao_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSubmissions((data || []) as Submission[]);
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Autosave local
  useEffect(() => {
    if (view !== "write") return;
    const id = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ tema: selectedTema, texto }));
      setSavedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }, 1500);
    return () => window.clearTimeout(id);
  }, [texto, selectedTema, view]);

  const startWriting = (tema: string) => {
    setSelectedTema(tema);
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.tema === tema && d.texto) setTexto(d.texto);
        else setTexto("");
      } catch {
        setTexto("");
      }
    }
    setIgnored([]);
    setView("write");
  };

  /* ───────── Ações do corretor ───────── */
  const applySuggestion = (issue: Issue, suggestion: string) => {
    setTexto((t) => t.slice(0, issue.start) + suggestion + t.slice(issue.end));
    setActiveId(null);
    setSelection(null);
  };

  const selectIssue = (issue: Issue) => {
    setActiveId(issue.id);
    setSelection({ start: issue.start, end: issue.end });
  };

  const ignoreIssue = (issue: Issue) => setIgnored((l) => [...l, issue.id]);

  const addToDict = (issue: Issue) => {
    addPersonalWord(issue.text.toLowerCase());
    setIgnored((l) => [...l, issue.id]);
    bump.current++;
    forceUpdate((n) => n + 1);
    toast({ title: "Palavra adicionada", description: `"${issue.text}" foi salva no seu dicionário pessoal.` });
  };

  /* ───────── Exportação ───────── */
  const exportar = async (format: "txt" | "pdf" | "docx") => {
    const nome = `redacao-${new Date().toISOString().slice(0, 10)}`;
    const conteudo = `${selectedTema}\n\n${texto}`;
    const { saveAs } = await import("file-saver");

    if (format === "txt") {
      saveAs(new Blob([conteudo], { type: "text/plain;charset=utf-8" }), `${nome}.txt`);
    } else if (format === "pdf") {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      doc.setFontSize(13);
      doc.text(doc.splitTextToSize(selectedTema || "Redação", 480), 56, 60);
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(texto, 480);
      let y = 110;
      for (const line of lines) {
        if (y > 780) {
          doc.addPage();
          y = 60;
        }
        doc.text(line, 56, y);
        y += 17;
      }
      doc.save(`${nome}.pdf`);
    } else {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ children: [new TextRun({ text: selectedTema || "Redação", bold: true, size: 28 })] }),
              new Paragraph({ children: [] }),
              ...texto.split("\n").map((p) => new Paragraph({ children: [new TextRun({ text: p, size: 24 })] })),
            ],
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${nome}.docx`);
    }
    toast({ title: "Exportado!", description: `Arquivo ${format.toUpperCase()} gerado.` });
  };

  const copiar = () => {
    navigator.clipboard.writeText(texto);
    toast({ title: "Copiado!", description: "Texto copiado para a área de transferência." });
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  };

  const salvar = async () => {
    if (!user || !texto.trim()) return;
    setSaving(true);
    const feedback = enem.competencias.map((c) => `${c.nome}: ${c.nota}/200 — ${c.dica}`).join("\n");
    await supabase.from("redacao_submissions").insert({
      user_id: user.id,
      tema: selectedTema || "Tema livre",
      texto,
      nota: enem.notaEstimada,
      feedback,
    });
    setSaving(false);
    toast({ title: "Redação salva!", description: `Nota estimada por regras: ${enem.notaEstimada}/1000` });
    loadHistory();
  };

  const progresso = Math.min(100, Math.round((stats.palavras / 300) * 100));

  if (!user) {
    return (
      <>
        <AppNav />
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Faça login para praticar redação.</p>
        </div>
      </>
    );
  }

  /* ───────── DETALHE ───────── */
  if (view === "detail" && selectedSub) {
    return (
      <>
        <AppNav />
        <div className="min-h-screen bg-background pb-20">
          <div className="container max-w-2xl space-y-4 py-6">
            <button onClick={() => setView("history")} className="flex items-center gap-1 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="font-display text-lg font-bold">{selectedSub.tema}</h2>
            {selectedSub.nota !== null && (
              <p className="text-2xl font-bold text-primary">{selectedSub.nota}/1000</p>
            )}
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <p className="whitespace-pre-wrap text-sm">{selectedSub.texto}</p>
            </div>
            {selectedSub.feedback && (
              <div className="rounded-2xl border border-primary/20 bg-card p-4 shadow-card">
                <h3 className="mb-2 font-display text-sm font-bold">Análise por competências</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedSub.feedback}</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ───────── EDITOR ───────── */
  if (view === "write") {
    return (
      <>
        {!fullscreen && <AppNav />}
        <div className="min-h-screen bg-background pb-10">
          <div className={`container py-4 ${fullscreen ? "max-w-none" : "max-w-6xl"}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setView("home")}
                className="flex items-center gap-1 text-sm text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Temas
              </button>
              <Toolbar
                fullscreen={fullscreen}
                onToggleFullscreen={() => setFullscreen((f) => !f)}
                dark={dark}
                onToggleDark={toggleDark}
                onCopy={copiar}
                onExport={exportar}
                onSave={salvar}
                saving={saving}
                savedAt={savedAt}
              />
            </div>

            <div className="mb-3 rounded-xl bg-card p-3 shadow-card">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tema</p>
              <p className="font-display text-sm font-bold">{selectedTema || "Tema livre"}</p>
            </div>

            {/* Barra de progresso da redação */}
            <div className="mb-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${progresso}%` }} />
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                <span>{stats.palavras} palavras</span>
                <span>{stats.caracteres} caracteres</span>
                <span>{stats.paragrafos} parágrafos</span>
                <span>{stats.linhas} linhas</span>
                <span>leitura {stats.tempoLeitura} min</span>
                <span>escrita ~{stats.tempoEscrita} min</span>
                {!dictReady && (
                  <span className="flex items-center gap-1 text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" /> carregando dicionário…
                  </span>
                )}
                {dictReady && analyzing && <span className="text-primary">analisando…</span>}
              </div>
            </div>

            <div className={`grid gap-4 ${fullscreen ? "lg:grid-cols-[1fr_360px]" : "lg:grid-cols-[1fr_340px]"}`}>
              <Editor
                value={texto}
                onChange={setTexto}
                issues={issues}
                activeId={activeId}
                selection={selection}
                fullscreen={fullscreen}
              />
              <div className="max-h-[70vh] overflow-hidden">
                <Sidebar
                  issues={issues}
                  stats={stats}
                  enem={enem}
                  activeId={activeId}
                  onSelect={selectIssue}
                  onApply={applySuggestion}
                  onIgnore={ignoreIssue}
                  onAddToDictionary={addToDict}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ───────── HISTÓRICO ───────── */
  if (view === "history") {
    return (
      <>
        <AppNav />
        <div className="min-h-screen bg-background pb-20">
          <div className="container max-w-lg space-y-4 py-6">
            <button onClick={() => setView("home")} className="flex items-center gap-1 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <h2 className="font-display text-xl font-bold">Histórico de Redações</h2>
            {submissions.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhuma redação salva ainda</p>
              </div>
            ) : (
              submissions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="cursor-pointer rounded-2xl bg-card p-4 shadow-card transition-transform hover:-translate-y-0.5"
                  onClick={() => {
                    setSelectedSub(s);
                    setView("detail");
                  }}
                >
                  <p className="font-display text-sm font-bold">{s.tema}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    {s.nota !== null && <span className="text-xs font-bold text-primary">{s.nota}/1000</span>}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  /* ───────── HOME ───────── */
  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-lg space-y-5 py-6">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
              <PenTool className="h-6 w-6 text-primary" /> Redação ENEM
            </h1>
            <p className="text-sm text-muted-foreground">
              Corretor ortográfico e gramatical offline — sem IA, 100% baseado em regras.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="hero" className="flex-1 rounded-full" onClick={() => startWriting("")}>
              <PenTool className="mr-1 h-4 w-4" /> Tema livre
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setView("history")}>
              <FileText className="mr-1 h-4 w-4" /> Histórico ({submissions.length})
            </Button>
          </div>

          <div className="rounded-2xl bg-card p-4 shadow-card">
            <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
              <BookOpen className="h-4 w-4 text-primary" /> Estrutura ideal
            </h3>
            <div className="space-y-1.5">
              {[
                "Introdução: tema + tese + 2 argumentos",
                "D1: Repertório + argumento 1",
                "D2: Repertório + argumento 2",
                "Conclusão: Proposta de intervenção completa",
              ].map((t, i) => (
                <p key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  {t}
                </p>
              ))}
            </div>
          </div>

          <h3 className="font-display text-sm font-bold">Escolha um tema</h3>
          <div className="space-y-2">
            {TEMAS_ENEM.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="cursor-pointer rounded-xl bg-card p-4 shadow-card transition-transform hover:-translate-y-0.5"
                onClick={() => startWriting(t.titulo)}
              >
                <p className="text-sm font-semibold">{t.titulo}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">ENEM {t.ano}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
