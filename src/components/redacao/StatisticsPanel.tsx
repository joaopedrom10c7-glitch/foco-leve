import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { EnemAnalysis, Statistics } from "@/services/redacao/TextAnalyzer";

interface Props {
  stats: Statistics;
  enem: EnemAnalysis;
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5 text-xs last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-display font-bold">{value}</span>
    </div>
  );
}

export default function StatisticsPanel({ stats, enem }: Props) {
  const classes = [
    { nome: "Verbos", v: enem.verbos },
    { nome: "Subst.", v: enem.substantivos },
    { nome: "Adjet.", v: enem.adjetivos },
    { nome: "Pron.", v: enem.pronomes },
    { nome: "Advér.", v: enem.adverbios },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card p-4 shadow-card">
        <h4 className="mb-2 font-display text-sm font-bold">Estatísticas</h4>
        <Row label="Palavras" value={stats.palavras} />
        <Row label="Caracteres" value={stats.caracteres} />
        <Row label="Caracteres (sem espaço)" value={stats.caracteresSemEspaco} />
        <Row label="Frases" value={stats.frases} />
        <Row label="Parágrafos" value={stats.paragrafos} />
        <Row label="Linhas" value={stats.linhas} />
        <Row label="Palavras únicas" value={stats.palavrasUnicas} />
        <Row label="Palavras repetidas" value={stats.palavrasRepetidas} />
        <Row label="Média por frase" value={`${stats.mediaFrase} palavras`} />
        <Row label="Tempo de leitura" value={`${stats.tempoLeitura} min`} />
        <Row label="Tempo de escrita" value={`${stats.tempoEscrita} min`} />
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <h4 className="mb-2 font-display text-sm font-bold">Análise ENEM</h4>
        <Row label="Conectivos" value={enem.conectivos} />
        <Row label="Repertório/citações" value={enem.citacoes} />
        <Row label="Períodos" value={enem.periodos} />
        <Row label="Parágrafos argumentativos" value={enem.argumentos} />
        {enem.conectivos < 5 && (
          <p className="mt-2 rounded-lg bg-warning/10 p-2 text-xs text-warning">
            Sua redação possui poucos conectivos. Use "Ademais", "Dessa forma", "Portanto"…
          </p>
        )}
        {enem.conectivosUsados.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {enem.conectivosUsados.slice(0, 12).map((c) => (
              <span key={c} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <h4 className="mb-2 font-display text-sm font-bold">Classes gramaticais</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classes}>
              <XAxis dataKey="nome" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ fontSize: 12, borderRadius: 12 }} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                {classes.map((_, i) => (
                  <Cell key={i} fill="hsl(var(--primary))" opacity={1 - i * 0.14} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-4 shadow-card">
        <h4 className="mb-2 font-display text-sm font-bold">
          Nota estimada (por regras) ·{" "}
          <span className="text-primary">{enem.notaEstimada}/1000</span>
        </h4>
        <div className="space-y-2">
          {enem.competencias.map((c) => (
            <div key={c.nome}>
              <div className="flex justify-between text-xs">
                <span>{c.nome}</span>
                <span className="font-bold">{c.nota}/200</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${(c.nota / 200) * 100}%` }} />
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{c.dica}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
