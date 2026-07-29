import { ISSUE_META, type Issue } from "@/services/redacao/types";

interface Props {
  text: string;
  issues: Issue[];
  activeId: string | null;
}

const CLASS: Record<Issue["type"], string> = {
  ortografia: "bg-destructive/15 border-b-2 border-destructive",
  gramatica: "bg-warning/15 border-b-2 border-warning",
  pontuacao: "bg-warning/10 border-b-2 border-warning/60",
  repeticao: "bg-accent/20 border-b-2 border-accent",
  sugestao: "bg-primary/10 border-b-2 border-primary",
};

/** Camada de destaque renderizada atrás do textarea (texto espelhado). */
export default function HighlightLayer({ text, issues, activeId }: Props) {
  const parts: JSX.Element[] = [];
  let cursor = 0;
  const sorted = [...issues].sort((a, b) => a.start - b.start);

  sorted.forEach((issue, i) => {
    if (issue.start < cursor) return;
    if (issue.start > cursor) parts.push(<span key={`t${i}`}>{text.slice(cursor, issue.start)}</span>);
    parts.push(
      <mark
        key={`m${i}`}
        className={`rounded-sm bg-transparent text-transparent ${CLASS[issue.type]} ${
          activeId === issue.id ? "ring-2 ring-primary/60" : ""
        }`}
      >
        {text.slice(issue.start, issue.end)}
      </mark>,
    );
    cursor = issue.end;
  });
  parts.push(<span key="rest">{text.slice(cursor)}</span>);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words p-4 text-base leading-relaxed text-transparent"
    >
      {parts}
      {"\n"}
    </div>
  );
}

export { ISSUE_META };
