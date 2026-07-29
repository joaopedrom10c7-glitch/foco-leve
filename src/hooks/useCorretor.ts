import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadDictionary } from "@/services/redacao/Dictionary";
import { checkGrammar, checkPunctuation, checkRepetition } from "@/services/redacao/GrammarChecker";
import { checkSpelling } from "@/services/redacao/SpellChecker";
import { analyzeEnem, computeStatistics, type EnemAnalysis, type Statistics } from "@/services/redacao/TextAnalyzer";
import type { Issue } from "@/services/redacao/types";

interface CorretorState {
  issues: Issue[];
  stats: Statistics;
  enem: EnemAnalysis;
  dictReady: boolean;
  analyzing: boolean;
}

/** Analisa o texto de forma incremental e sem travar a digitação. */
export function useCorretor(text: string, delay = 500): CorretorState {
  const [dictReady, setDictReady] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const cache = useRef(new Map<string, Issue[]>());

  useEffect(() => {
    let alive = true;
    loadDictionary()
      .then(() => alive && setDictReady(true))
      .catch(() => alive && setDictReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const run = useCallback((value: string) => {
    const cached = cache.current.get(value);
    if (cached) {
      setIssues(cached);
      setAnalyzing(false);
      return;
    }
    const found = [
      ...checkSpelling(value),
      ...checkGrammar(value),
      ...checkPunctuation(value),
      ...checkRepetition(value),
    ].sort((a, b) => a.start - b.start);

    // Remove sobreposições do mesmo tipo
    const dedup: Issue[] = [];
    for (const i of found) {
      if (dedup.some((d) => d.start === i.start && d.type === i.type)) continue;
      dedup.push(i);
    }
    if (cache.current.size > 40) cache.current.clear();
    cache.current.set(value, dedup);
    setIssues(dedup);
    setAnalyzing(false);
  }, []);

  useEffect(() => {
    if (!dictReady) return;
    setAnalyzing(true);
    const id = window.setTimeout(() => run(text), delay);
    return () => window.clearTimeout(id);
  }, [text, dictReady, delay, run]);

  const stats = useMemo(() => computeStatistics(text), [text]);
  const enem = useMemo(
    () => analyzeEnem(text, issues.filter((i) => i.type === "ortografia" || i.type === "gramatica").length),
    [text, issues],
  );

  return { issues, stats, enem, dictReady, analyzing };
}
