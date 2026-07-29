import { useEffect, useRef } from "react";
import HighlightLayer from "@/components/redacao/HighlightLayer";
import type { Issue } from "@/services/redacao/types";

interface Props {
  value: string;
  onChange: (v: string) => void;
  issues: Issue[];
  activeId: string | null;
  selection: { start: number; end: number } | null;
  fullscreen: boolean;
}

/** Editor com camada de destaque sincronizada (estilo Google Docs). */
export default function Editor({ value, onChange, issues, activeId, selection, fullscreen }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selection || !taRef.current) return;
    const ta = taRef.current;
    ta.focus();
    ta.setSelectionRange(selection.start, selection.end);
    // Aproxima o scroll do trecho selecionado
    const ratio = selection.start / Math.max(value.length, 1);
    ta.scrollTop = Math.max(0, ta.scrollHeight * ratio - ta.clientHeight / 2);
  }, [selection, value.length]);

  const syncScroll = () => {
    if (wrapRef.current && taRef.current) {
      wrapRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div
        ref={wrapRef}
        className={`pointer-events-none absolute inset-0 overflow-hidden ${fullscreen ? "" : ""}`}
      >
        <div className="relative min-h-full">
          <HighlightLayer text={value} issues={issues} activeId={activeId} />
        </div>
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        placeholder="Comece a escrever sua redação aqui… O corretor funciona 100% offline, sem IA."
        className={`relative w-full resize-none bg-transparent p-4 text-base leading-relaxed text-foreground outline-none ${
          fullscreen ? "h-[calc(100dvh-13rem)]" : "h-[55vh] min-h-[380px]"
        }`}
      />
    </div>
  );
}
