import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import AppNav from "@/components/AppNav";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HORARIOS = [
  "06:00","07:00","08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00",
];

const CORES_AREA: Record<string, string> = {
  "Linguagens": "hsl(210 80% 55%)",
  "Matemática": "hsl(15 85% 60%)",
  "Ciências Humanas": "hsl(40 90% 55%)",
  "Ciências da Natureza": "hsl(145 60% 45%)",
  "Redação": "hsl(280 60% 55%)",
};

interface CellData {
  id?: string;
  materia: string;
  conteudo: string;
  tipo_estudo: string;
  duracao: number;
  cor: string;
}

export default function CronogramaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [grid, setGrid] = useState<Record<string, CellData>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ materia: "", conteudo: "", tipo_estudo: "leitura", duracao: 60 });

  const cellKey = (dia: number, hora: string) => `${dia}-${hora}`;

  const loadData = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("cronograma").select("*").eq("user_id", user.id);
    if (data) {
      const g: Record<string, CellData> = {};
      data.forEach((r: any) => {
        g[cellKey(r.dia_semana, r.horario)] = {
          id: r.id, materia: r.materia, conteudo: r.conteudo,
          tipo_estudo: r.tipo_estudo, duracao: r.duracao, cor: r.cor,
        };
      });
      setGrid(g);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const saveCell = async (dia: number, hora: string) => {
    if (!user || !form.materia.trim()) return;
    const cor = CORES_AREA[form.materia] || "hsl(165 55% 42%)";
    const key = cellKey(dia, hora);
    const existing = grid[key];

    if (existing?.id) {
      await supabase.from("cronograma").update({
        materia: form.materia, conteudo: form.conteudo,
        tipo_estudo: form.tipo_estudo, duracao: form.duracao, cor,
      }).eq("id", existing.id);
    } else {
      await supabase.from("cronograma").insert({
        user_id: user.id, dia_semana: dia, horario: hora,
        materia: form.materia, conteudo: form.conteudo,
        tipo_estudo: form.tipo_estudo, duracao: form.duracao, cor,
      });
    }
    setEditing(null);
    loadData();
  };

  const deleteCell = async (key: string) => {
    const cell = grid[key];
    if (cell?.id) {
      await supabase.from("cronograma").delete().eq("id", cell.id);
      loadData();
    }
  };

  const exportXLSX = () => {
    const rows: any[] = [];
    HORARIOS.forEach(h => {
      const row: Record<string, string> = { Horário: h };
      DIAS.forEach((d, i) => {
        const cell = grid[cellKey(i, h)];
        row[d] = cell ? `${cell.materia} - ${cell.conteudo}` : "";
      });
      rows.push(row);
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cronograma");
    XLSX.writeFile(wb, "cronograma-focoleve.xlsx");
    toast({ title: "Exportado!", description: "Cronograma salvo como .xlsx" });
  };

  if (!user) {
    return (
      <>
        <AppNav />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Faça login para acessar o cronograma.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-background pb-20">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-2xl">Cronograma Semanal</h1>
              <p className="text-sm text-muted-foreground">Organize seus estudos como uma planilha</p>
            </div>
            <Button onClick={exportXLSX} variant="outline" className="gap-2 rounded-full">
              <Download className="h-4 w-4" /> Exportar .xlsx
            </Button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(CORES_AREA).map(([area, cor]) => (
              <span key={area} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded" style={{ background: cor }} />
                {area}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-2 text-left font-semibold min-w-[60px] sticky left-0 bg-muted/50">Hora</th>
                  {DIAS.map(d => (
                    <th key={d} className="p-2 text-center font-semibold min-w-[120px]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HORARIOS.map(hora => (
                  <tr key={hora} className="border-t border-border/50">
                    <td className="p-2 font-mono text-muted-foreground sticky left-0 bg-background">{hora}</td>
                    {DIAS.map((_, dia) => {
                      const key = cellKey(dia, hora);
                      const cell = grid[key];
                      const isEditing = editing === key;
                      return (
                        <td key={key} className="p-1 border-l border-border/30 relative group">
                          {isEditing ? (
                            <div className="bg-card p-2 rounded-lg shadow-elevated space-y-1.5 min-w-[160px] absolute z-10 left-0 top-0">
                              <select
                                className="w-full text-xs p-1.5 rounded border bg-background"
                                value={form.materia}
                                onChange={e => setForm({ ...form, materia: e.target.value })}
                              >
                                <option value="">Matéria</option>
                                {Object.keys(CORES_AREA).map(a => <option key={a}>{a}</option>)}
                              </select>
                              <Input
                                className="h-7 text-xs" placeholder="Conteúdo"
                                value={form.conteudo}
                                onChange={e => setForm({ ...form, conteudo: e.target.value })}
                              />
                              <select
                                className="w-full text-xs p-1.5 rounded border bg-background"
                                value={form.tipo_estudo}
                                onChange={e => setForm({ ...form, tipo_estudo: e.target.value })}
                              >
                                <option value="leitura">Leitura</option>
                                <option value="exercicios">Exercícios</option>
                                <option value="revisao">Revisão</option>
                                <option value="simulado">Simulado</option>
                              </select>
                              <div className="flex gap-1">
                                <Button size="sm" className="h-6 text-xs flex-1" onClick={() => saveCell(dia, hora)}>Salvar</Button>
                                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditing(null)}><X className="h-3 w-3" /></Button>
                              </div>
                            </div>
                          ) : cell ? (
                            <div
                              className="rounded-lg p-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ background: cell.cor + "22", borderLeft: `3px solid ${cell.cor}` }}
                              onClick={() => {
                                setForm({ materia: cell.materia, conteudo: cell.conteudo, tipo_estudo: cell.tipo_estudo, duracao: cell.duracao });
                                setEditing(key);
                              }}
                            >
                              <p className="font-semibold truncate" style={{ color: cell.cor }}>{cell.materia}</p>
                              <p className="text-muted-foreground truncate">{cell.conteudo}</p>
                              <button
                                className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={e => { e.stopPropagation(); deleteCell(key); }}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="w-full h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setForm({ materia: "", conteudo: "", tipo_estudo: "leitura", duracao: 60 });
                                setEditing(key);
                              }}
                            >
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
