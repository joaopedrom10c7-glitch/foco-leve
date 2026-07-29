import type { Sentence, Token } from "@/services/redacao/types";

/** Remove acentos e normaliza para comparações. */
export function normalize(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const WORD_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[''-][A-Za-zÀ-ÖØ-öø-ÿ]+)*/g;

/** Divide o texto em palavras com posições absolutas. */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let m: RegExpExecArray | null;
  WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(text)) !== null) {
    tokens.push({ text: m[0], start: m.index, end: m.index + m[0].length });
  }
  return tokens;
}

/** Divide o texto em frases com posições absolutas. */
export function splitSentences(text: string): Sentence[] {
  const out: Sentence[] = [];
  const re = /[^.!?…]+(?:[.!?…]+|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    if (!raw.trim()) continue;
    const lead = raw.length - raw.trimStart().length;
    const t = raw.trim();
    out.push({ text: t, start: m.index + lead, end: m.index + lead + t.length });
  }
  return out;
}

export function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n|\n/).filter((p) => p.trim().length > 0);
}

export function countWords(text: string): number {
  return tokenize(text).length;
}

/** Tempo de leitura em minutos (200 ppm). */
export function readingTime(words: number): number {
  return Math.max(1, Math.round(words / 200));
}

/** Tempo estimado de escrita em minutos (~25 ppm à mão). */
export function writingTime(words: number): number {
  return Math.max(1, Math.round(words / 25));
}
