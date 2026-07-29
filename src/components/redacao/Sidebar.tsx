import { useState } from "react";
import SuggestionCard from "@/components/redacao/SuggestionCard";
import StatisticsPanel from "@/components/redacao/StatisticsPanel";
import type { EnemAnalysis, Statistics } from "@/services/redacao/TextAnalyzer";
import { ISSUE_META, type Issue, type IssueType } from "@/services/redacao/types";
import { CheckCircle2 } from "lucide-react";

const TABS: (IssueType | "estatisticas")[] = [
  "ortografia",
  "gramatica",
  "pontuacao",
  "repeticao",
  "sugestao",
  "estatisticas",
];

interface Props {
  issues: Issue[];
  stats: Statistics;
  enem: EnemAnalysis;
  activeId: string | null;
  onSelect: (issue: Issue) => void;
  onApply: (issue: Issue, suggestion: string) => void;
  onIgnore: (issue: Issue) => void;
  onAddToDictionary: (issue: Issue) => void;
}

export default function Sidebar({ issues, stats, enem, activeId, onSelect, onApply, onIgnore, onAddToDictionary }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("ortografia");
  const count = (t: IssueType) => issues.filter((i) => i.type === t).length;
  const list = tab === "estatisticas" ? [] : issues.filter((i) => i.type === tab);

  return (
    <aside className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const isStats = t === "estatisticas";
          const label = isStats ? "Estatísticas" : ISSUE_META[t as IssueType].label;
          const n = isStats ? null : count(t as IssueType);
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {label}
              {n !== null && n > 0 && <span className="ml-1 opacity-80">{n}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {tab === "estatisticas" ? (
          <StatisticsPanel stats={stats} enem={enem} />
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CheckCircle2 className="mb-2 h-8 w-8 text-success" />
            <p className="text-sm text-muted-foreground">Nenhum problema nesta categoria.</p>
          </div>
        ) : (
          list.map((issue) => (
            <SuggestionCard
              key={issue.id}
              issue={issue}
              active={activeId === issue.id}
              onSelect={() => onSelect(issue)}
              onApply={(s) => onApply(issue, s)}
              onIgnore={() => onIgnore(issue)}
              onAddToDictionary={() => onAddToDictionary(issue)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
