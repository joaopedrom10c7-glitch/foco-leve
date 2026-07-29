import { levenshtein } from "@/services/redacao/Levenshtein";
import {
  COMMON_WORDS,
  getDictionary,
  getPersonalWords,
} from "@/services/redacao/Dictionary";
import type { Issue } from "@/services/redacao/types";
import { normalize, tokenize } from "@/utils/text";

const ROMAN = /^[ivxlcdm]+$/;

function isKnown(word: string): boolean {
  const dict = getDictionary();
  if (!dict) return true;
  const lower = word.toLowerCase();
  if (dict.words.has(lower)) return true;
  // Palavra com hífen: valida cada parte
  if (lower.includes("-")) {
    return lower.split("-").every((p) => p.length < 2 || dict.words.has(p));
  }
  return false;
}

/** Gera sugestões ordenadas por proximidade + frequência. */
export function suggest(word: string, limit = 5): string[] {
  const dict = getDictionary();
  if (!dict) return [];
  const lower = word.toLowerCase();
  const scored: { w: string; s: number }[] = [];

  // 1. Acento faltando / trocado
  const na = normalize(lower);
  const accented = dict.deaccent.get(na);
  if (accented && accented !== lower) scored.push({ w: accented, s: 100 });

  // 2. Vizinhos por distância de edição (mesma inicial, tamanho ±2)
  const first = lower[0];
  const maxDist = lower.length <= 4 ? 1 : lower.length <= 8 ? 2 : 3;
  const initials = new Set([first, normalize(first)]);
  for (const ini of initials) {
    for (let len = lower.length - 2; len <= lower.length + 2; len++) {
      if (len < 2) continue;
      const bucket = dict.buckets.get(ini + ":" + len);
      if (!bucket) continue;
      for (const cand of bucket) {
        if (cand === lower) continue;
        const d = levenshtein(lower, cand, maxDist);
        if (d > maxDist) continue;
        const freq = COMMON_WORDS.has(cand) ? 8 : 0;
        scored.push({ w: cand, s: 50 - d * 10 + freq - Math.abs(cand.length - lower.length) });
      }
    }
  }

  scored.sort((a, b) => b.s - a.s);
  const out: string[] = [];
  for (const { w } of scored) {
    if (!out.includes(w)) out.push(w);
    if (out.length >= limit) break;
  }
  return out;
}

/** Preserva a capitalização original ao aplicar uma sugestão. */
export function matchCase(original: string, replacement: string): string {
  if (original === original.toUpperCase() && original.length > 1) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase())
    return replacement[0].toUpperCase() + replacement.slice(1);
  return replacement;
}

/** Verifica a ortografia de todo o texto. */
export function checkSpelling(text: string): Issue[] {
  const dict = getDictionary();
  if (!dict) return [];
  for (const p of getPersonalWords()) dict.words.add(p);

  const issues: Issue[] = [];
  for (const tk of tokenize(text)) {
    const w = tk.text;
    if (w.length < 2) continue;
    // Siglas e numerais romanos
    if (w === w.toUpperCase() && w.length > 1) continue;
    if (ROMAN.test(w.toLowerCase()) && w === w.toUpperCase()) continue;
    if (isKnown(w)) continue;

    issues.push({
      id: `sp-${tk.start}`,
      type: "ortografia",
      start: tk.start,
      end: tk.end,
      text: w,
      message: `"${w}" não foi encontrada no dicionário.`,
      suggestions: suggest(w).map((s) => matchCase(w, s)),
    });
  }
  return issues;
}
