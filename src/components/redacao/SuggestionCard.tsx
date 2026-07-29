import { Button } from "@/components/ui/button";
import { ISSUE_META, type Issue } from "@/services/redacao/types";
import { Check, Plus } from "lucide-react";

interface Props {
  issue: Issue;
  active: boolean;
  onSelect: () => void;
  onApply: (suggestion: string) => void;
  onIgnore: () => void;
  onAddToDictionary?: () => void;
}

export default function SuggestionCard({ issue, active, onSelect, onApply, onIgnore, onAddToDictionary }: Props) {
  const meta = ISSUE_META[issue.type];
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition-all ${
        active ? "border-primary bg-primary/5 shadow-card" : "border-border bg-card hover:bg-muted/40"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>{meta.label}</span>
        <span className="truncate font-mono text-xs text-muted-foreground">"{issue.text}"</span>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{issue.message}</p>
      <div className="flex flex-wrap gap-1.5">
        {issue.suggestions.slice(0, 4).map((s) => (
          <Button
            key={s}
            size="sm"
            variant="secondary"
            className="h-7 rounded-full px-3 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onApply(s);
            }}
          >
            <Check className="mr-1 h-3 w-3" /> {s}
          </Button>
        ))}
        {issue.type === "ortografia" && onAddToDictionary && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 rounded-full px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAddToDictionary();
            }}
          >
            <Plus className="mr-1 h-3 w-3" /> Dicionário
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 rounded-full px-2 text-xs text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onIgnore();
          }}
        >
          Ignorar
        </Button>
      </div>
    </button>
  );
}
