import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, BookText } from "lucide-react";
import AppNav from "@/components/AppNav";
import { useToast } from "@/hooks/use-toast";

interface Repertorio { id: string; materia: string; tema: string; texto: string; autor: string; }

const MATERIAS = ["Todas", "Redação", "Ciências Humanas", "Linguagens", "Matemática", "Ciências da Natureza"];

export default function RepertorioPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Repertorio[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [filtro, setFiltro] = useState("Todas");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("repertorio_enem").select("*").order("materia");
      if (data) setItems(data as Repertorio[]);
      if (user) {
        const { data: favs } = await supabase.from("repertorio_favoritos").select("repertorio_id").eq("user_id", user.id);
        if (favs) setFavoritos(favs.map((f: any) => f.repertorio_id));
      }
    };
    load();
  }, [user]);

  const toggleFav = async (id: string) => {
    if (!user) return;
    if (favoritos.includes(id)) {
      await supabase.from("repertorio_favoritos").delete().eq("user_id", user.id).eq("repertorio_id", id);
      setFavoritos(favoritos.filter(f => f !== id));
    } else {
      await supabase.from("repertorio_favoritos").insert({ user_id: user.id, repertorio_id: id });
      setFavoritos([...favoritos, id]);
      toast({ title: "Salvo nos favoritos! ⭐" });
    }
  };

  const filtered = items.filter(i => {
    if (filtro !== "Todas" && i.materia !== filtro) return false;
    if (busca) {
      const q = busca.toLowerCase();
      return i.texto.toLowerCase().includes(q) || i.tema.toLowerCase().includes(q) || i.autor.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-20">
        <div className="container py-6 max-w-2xl space-y-4">
          <div>
            <h1 className="font-display font-bold text-2xl flex items-center gap-2">
              <BookText className="h-6 w-6 text-primary" /> Repertório ENEM
            </h1>
            <p className="text-sm text-muted-foreground">Textos e citações para usar na redação</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tema, autor ou texto..."
              className="pl-9 rounded-full"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MATERIAS.map(m => (
              <button
                key={m}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  filtro === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setFiltro(m)}
              >{m}</button>
            ))}
          </div>

          {/* Items */}
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2 items-center">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{item.materia}</span>
                    <span className="text-xs text-muted-foreground">{item.tema}</span>
                  </div>
                  {user && (
                    <button onClick={() => toggleFav(item.id)} className="transition-transform active:scale-90">
                      <Heart className={`h-5 w-5 ${favoritos.includes(item.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground italic">"{item.texto}"</p>
                <p className="text-xs text-muted-foreground mt-2">— {item.autor}</p>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum resultado encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
