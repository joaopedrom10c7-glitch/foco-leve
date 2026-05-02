import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, RotateCcw, ArrowLeft, Tag, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppNav from "@/components/AppNav";

interface Deck { id: string; nome: string; materia: string; count?: number; due?: number; }
interface Flashcard {
  id: string; deck_id: string; frente: string; verso: string;
  tags: string[]; facilidade: number; intervalo: number;
  proxima_revisao: string; repeticoes: number;
}

function sm2(quality: number, card: Flashcard): Partial<Flashcard> {
  // SM-2 algorithm
  let { facilidade, intervalo, repeticoes } = card;
  if (quality >= 3) {
    repeticoes += 1;
    if (repeticoes === 1) intervalo = 1;
    else if (repeticoes === 2) intervalo = 6;
    else intervalo = Math.round(intervalo * facilidade);
  } else {
    repeticoes = 0;
    intervalo = 1;
  }
  facilidade = Math.max(1.3, facilidade + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const next = new Date();
  next.setDate(next.getDate() + intervalo);
  return { facilidade, intervalo, repeticoes, proxima_revisao: next.toISOString() };
}

export default function FlashcardsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [view, setView] = useState<"decks" | "cards" | "study" | "create">("decks");
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Create form
  const [newDeck, setNewDeck] = useState({ nome: "", materia: "" });
  const [newCard, setNewCard] = useState({ frente: "", verso: "", tags: "" });
  const [editingCard, setEditingCard] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("flashcard_decks").select("*").eq("user_id", user.id);
    if (!data) return;
    // get counts
    const enriched = await Promise.all(data.map(async (d: any) => {
      const { count } = await supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("deck_id", d.id);
      const { count: due } = await supabase.from("flashcards")
        .select("*", { count: "exact", head: true })
        .eq("deck_id", d.id)
        .lte("proxima_revisao", new Date().toISOString());
      return { ...d, count: count || 0, due: due || 0 };
    }));
    setDecks(enriched);
  }, [user]);

  const loadCards = useCallback(async (deckId: string) => {
    const { data } = await supabase.from("flashcards").select("*").eq("deck_id", deckId).order("created_at");
    if (data) setCards(data as Flashcard[]);
  }, []);

  useEffect(() => { loadDecks(); }, [loadDecks]);
  useEffect(() => { if (selectedDeck) loadCards(selectedDeck); }, [selectedDeck, loadCards]);

  const createDeck = async () => {
    if (!user || !newDeck.nome.trim()) return;
    await supabase.from("flashcard_decks").insert({ user_id: user.id, nome: newDeck.nome, materia: newDeck.materia });
    setNewDeck({ nome: "", materia: "" });
    loadDecks();
    toast({ title: "Deck criado!" });
  };

  const deleteDeck = async (id: string) => {
    await supabase.from("flashcard_decks").delete().eq("id", id);
    loadDecks();
  };

  const createCard = async () => {
    if (!user || !selectedDeck || !newCard.frente.trim()) return;
    const tags = newCard.tags.split(",").map(t => t.trim()).filter(Boolean);
    await supabase.from("flashcards").insert({
      user_id: user.id, deck_id: selectedDeck, frente: newCard.frente, verso: newCard.verso, tags,
    });
    setNewCard({ frente: "", verso: "", tags: "" });
    loadCards(selectedDeck);
    toast({ title: "Flashcard criado!" });
  };

  const updateCard = async (id: string) => {
    const tags = newCard.tags.split(",").map(t => t.trim()).filter(Boolean);
    await supabase.from("flashcards").update({ frente: newCard.frente, verso: newCard.verso, tags }).eq("id", id);
    setEditingCard(null);
    setNewCard({ frente: "", verso: "", tags: "" });
    loadCards(selectedDeck!);
  };

  const deleteCard = async (id: string) => {
    await supabase.from("flashcards").delete().eq("id", id);
    loadCards(selectedDeck!);
  };

  const startStudy = () => {
    const due = cards.filter(c => new Date(c.proxima_revisao) <= new Date());
    if (due.length === 0) {
      toast({ title: "Tudo revisado!", description: "Volte mais tarde para revisar novos cards." });
      return;
    }
    setStudyCards(due);
    setCurrentIdx(0);
    setFlipped(false);
    setView("study");
  };

  const gradeCard = async (quality: number) => {
    const card = studyCards[currentIdx];
    const updates = sm2(quality, card);
    await supabase.from("flashcards").update(updates).eq("id", card.id);
    if (currentIdx + 1 < studyCards.length) {
      setCurrentIdx(currentIdx + 1);
      setFlipped(false);
    } else {
      setView("cards");
      loadCards(selectedDeck!);
      loadDecks();
      toast({ title: "Sessão concluída! 🎉" });
    }
  };

  const exportDeck = () => {
    const data = cards.map(c => ({ frente: c.frente, verso: c.verso, tags: c.tags.join(",") }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "flashcards.json"; a.click();
  };

  const importDeck = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedDeck) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      for (const c of data) {
        await supabase.from("flashcards").insert({
          user_id: user.id, deck_id: selectedDeck,
          frente: c.frente || "", verso: c.verso || "",
          tags: typeof c.tags === "string" ? c.tags.split(",") : c.tags || [],
        });
      }
      loadCards(selectedDeck);
      toast({ title: `${data.length} cards importados!` });
    } catch { toast({ title: "Erro ao importar", variant: "destructive" }); }
  };

  if (!user) {
    return (
      <><AppNav /><div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Faça login para acessar flashcards.</p>
      </div></>
    );
  }

  // STUDY MODE
  if (view === "study" && studyCards.length > 0) {
    const card = studyCards[currentIdx];
    return (
      <><AppNav /><div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-lg">
          <button onClick={() => setView("cards")} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <p className="text-xs text-muted-foreground mb-2">{currentIdx + 1} / {studyCards.length}</p>
          <div
            className="bg-card rounded-2xl shadow-elevated p-8 min-h-[250px] flex items-center justify-center cursor-pointer transition-all hover:shadow-card"
            onClick={() => setFlipped(!flipped)}
          >
            <p className="font-display font-bold text-xl text-center">
              {flipped ? card.verso : card.frente}
            </p>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {flipped ? "Resposta" : "Toque para virar"}
          </p>
          {flipped && (
            <div className="flex gap-2 mt-6 justify-center">
              {[
                { label: "Esqueci", q: 1, color: "bg-destructive text-destructive-foreground" },
                { label: "Difícil", q: 3, color: "bg-warning text-warning-foreground" },
                { label: "Bom", q: 4, color: "bg-info text-info-foreground" },
                { label: "Fácil", q: 5, color: "bg-success text-success-foreground" },
              ].map(g => (
                <button
                  key={g.label}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${g.color} transition-transform active:scale-95`}
                  onClick={() => gradeCard(g.q)}
                >{g.label}</button>
              ))}
            </div>
          )}
        </div>
      </div></>
    );
  }

  // CARDS VIEW
  if (view === "cards" && selectedDeck) {
    return (
      <><AppNav /><div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-lg space-y-4">
          <button onClick={() => { setView("decks"); setSelectedDeck(null); }} className="flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Decks
          </button>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl">{decks.find(d => d.id === selectedDeck)?.nome}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportDeck} className="gap-1">
                <Download className="h-3 w-3" /> Exportar
              </Button>
              <label className="cursor-pointer">
                <Button size="sm" variant="outline" className="gap-1" asChild>
                  <span><Upload className="h-3 w-3" /> Importar</span>
                </Button>
                <input type="file" accept=".json" className="hidden" onChange={importDeck} />
              </label>
            </div>
          </div>

          <Button variant="hero" className="w-full rounded-full" onClick={startStudy}>
            <RotateCcw className="h-4 w-4 mr-2" /> Estudar agora
          </Button>

          {/* Create card */}
          <div className="bg-card rounded-xl p-4 shadow-card space-y-2">
            <Input placeholder="Frente" value={newCard.frente} onChange={e => setNewCard({ ...newCard, frente: e.target.value })} />
            <Textarea placeholder="Verso" value={newCard.verso} onChange={e => setNewCard({ ...newCard, verso: e.target.value })} className="min-h-[60px]" />
            <Input placeholder="Tags (separar por vírgula)" value={newCard.tags} onChange={e => setNewCard({ ...newCard, tags: e.target.value })} />
            <Button className="w-full" onClick={editingCard ? () => updateCard(editingCard) : createCard}>
              <Plus className="h-4 w-4 mr-1" /> {editingCard ? "Salvar" : "Adicionar"}
            </Button>
          </div>

          {/* Card list */}
          <div className="space-y-2">
            {cards.map(c => (
              <div key={c.id} className="bg-card rounded-xl p-3 shadow-card flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{c.frente}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.verso}</p>
                  {c.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {c.tags.map(t => (
                        <span key={t} className="bg-muted rounded px-1.5 py-0.5 text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Tag className="h-2 w-2" />{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => {
                    setEditingCard(c.id);
                    setNewCard({ frente: c.frente, verso: c.verso, tags: c.tags.join(", ") });
                  }}><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteCard(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div></>
    );
  }

  // DECKS VIEW
  return (
    <><AppNav /><div className="min-h-screen bg-background pb-20">
      <div className="container py-6 max-w-lg space-y-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Flashcards</h1>
          <p className="text-sm text-muted-foreground">Repetição espaçada estilo Anki</p>
        </div>

        {/* Create deck */}
        <div className="bg-card rounded-xl p-4 shadow-card space-y-2">
          <Input placeholder="Nome do deck" value={newDeck.nome} onChange={e => setNewDeck({ ...newDeck, nome: e.target.value })} />
          <select
            className="w-full text-sm p-2 rounded-lg border bg-background"
            value={newDeck.materia} onChange={e => setNewDeck({ ...newDeck, materia: e.target.value })}
          >
            <option value="">Matéria (opcional)</option>
            <option>Linguagens</option><option>Matemática</option>
            <option>Ciências Humanas</option><option>Ciências da Natureza</option><option>Redação</option>
          </select>
          <Button className="w-full" onClick={createDeck}><Plus className="h-4 w-4 mr-1" /> Criar Deck</Button>
        </div>

        {/* Deck list */}
        <div className="space-y-2">
          {decks.map(d => (
            <div
              key={d.id}
              className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between cursor-pointer hover:-translate-y-0.5 transition-transform"
              onClick={() => { setSelectedDeck(d.id); setView("cards"); }}
            >
              <div>
                <p className="font-display font-bold">{d.nome}</p>
                <p className="text-xs text-muted-foreground">{d.materia} • {d.count} cards • {d.due} para revisar</p>
              </div>
              <div className="flex items-center gap-2">
                {(d.due ?? 0) > 0 && (
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{d.due}</span>
                )}
                <button onClick={e => { e.stopPropagation(); deleteDeck(d.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
          {decks.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Crie seu primeiro deck acima!</p>}
        </div>
      </div>
    </div></>
  );
}
