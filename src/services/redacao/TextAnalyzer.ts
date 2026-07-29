import { CONECTIVOS, MARCADORES_CITACAO, PRONOMES, SUFIXOS } from "@/services/redacao/RuleEngine";
import {
  normalize,
  readingTime,
  splitParagraphs,
  splitSentences,
  tokenize,
  writingTime,
} from "@/utils/text";

export interface Statistics {
  caracteres: number;
  caracteresSemEspaco: number;
  palavras: number;
  palavrasUnicas: number;
  palavrasRepetidas: number;
  frases: number;
  paragrafos: number;
  linhas: number;
  maiorFrase: string;
  menorFrase: string;
  mediaFrase: number;
  tempoLeitura: number;
  tempoEscrita: number;
}

export interface EnemAnalysis {
  conectivos: number;
  conectivosUsados: string[];
  citacoes: number;
  periodos: number;
  mediaFrase: number;
  verbos: number;
  substantivos: number;
  adjetivos: number;
  pronomes: number;
  adverbios: number;
  argumentos: number;
  notaEstimada: number;
  competencias: { nome: string; nota: number; dica: string }[];
}

export function computeStatistics(text: string): Statistics {
  const tokens = tokenize(text);
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);
  const counts = new Map<string, number>();
  tokens.forEach((t) => {
    const k = normalize(t.text);
    counts.set(k, (counts.get(k) || 0) + 1);
  });
  const sorted = [...sentences].sort((a, b) => a.text.length - b.text.length);

  return {
    caracteres: text.length,
    caracteresSemEspaco: text.replace(/\s/g, "").length,
    palavras: tokens.length,
    palavrasUnicas: counts.size,
    palavrasRepetidas: [...counts.values()].filter((c) => c > 1).length,
    frases: sentences.length,
    paragrafos: paragraphs.length,
    linhas: text.split("\n").filter((l) => l.trim()).length,
    maiorFrase: sorted.length ? sorted[sorted.length - 1].text : "",
    menorFrase: sorted.length ? sorted[0].text : "",
    mediaFrase: sentences.length ? Math.round(tokens.length / sentences.length) : 0,
    tempoLeitura: readingTime(tokens.length),
    tempoEscrita: writingTime(tokens.length),
  };
}

function endsWithAny(word: string, list: string[]): boolean {
  return list.some((s) => word.length > s.length + 1 && word.endsWith(s));
}

export function analyzeEnem(text: string, erros: number): EnemAnalysis {
  const lower = " " + text.toLowerCase() + " ";
  const tokens = tokenize(text);
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);

  const conectivosUsados: string[] = [];
  let conectivos = 0;
  for (const c of CONECTIVOS) {
    if (c.length < 4) continue;
    const re = new RegExp(`(^|[^a-zà-öø-ÿ])${c}([^a-zà-öø-ÿ])`, "g");
    const n = (lower.match(re) || []).length;
    if (n > 0) {
      conectivos += n;
      conectivosUsados.push(c);
    }
  }

  let citacoes = 0;
  for (const c of MARCADORES_CITACAO) {
    const re = new RegExp(`(^|[^a-zà-öø-ÿ])${c}([^a-zà-öø-ÿ])`, "g");
    citacoes += (lower.match(re) || []).length;
  }

  let verbos = 0, substantivos = 0, adjetivos = 0, pronomes = 0, adverbios = 0;
  for (const t of tokens) {
    const w = t.text.toLowerCase();
    if (PRONOMES.includes(w)) { pronomes++; continue; }
    if (endsWithAny(w, SUFIXOS.adverbio)) { adverbios++; continue; }
    if (endsWithAny(w, SUFIXOS.substantivo)) { substantivos++; continue; }
    if (endsWithAny(w, SUFIXOS.adjetivo)) { adjetivos++; continue; }
    if (endsWithAny(w, SUFIXOS.verbo)) { verbos++; continue; }
  }

  const mediaFrase = sentences.length ? Math.round(tokens.length / sentences.length) : 0;
  const argumentos = Math.max(0, paragraphs.length - 2);

  /* Nota estimada — 5 competências, 0 a 200 cada (regras, sem IA) */
  const densidadeErros = tokens.length ? erros / tokens.length : 1;
  const c1 = Math.round(Math.max(40, 200 - densidadeErros * 2000));
  const c2 = Math.round(Math.min(200, 60 + Math.min(citacoes, 4) * 25 + Math.min(tokens.length / 300, 1) * 40));
  const c3 = Math.round(Math.min(200, 60 + argumentos * 45 + Math.min(paragraphs.length, 5) * 10));
  const c4 = Math.round(Math.min(200, 40 + Math.min(conectivos, 12) * 13));
  const temProposta = /(propõe|proposta|é necessário que|deve[- ]se|cabe ao|por meio de|a fim de|com o intuito|ministério|governo|escola|mídia)/i.test(text);
  const c5 = Math.round(temProposta ? Math.min(200, 100 + Math.min(paragraphs.length, 4) * 25) : 60);

  const competencias = [
    { nome: "C1 · Norma culta", nota: c1, dica: erros > 0 ? `${erros} desvios detectados no texto.` : "Sem desvios detectados." },
    { nome: "C2 · Tema e repertório", nota: c2, dica: `${citacoes} marcadores de repertório encontrados.` },
    { nome: "C3 · Argumentação", nota: c3, dica: `${argumentos} parágrafos de desenvolvimento.` },
    { nome: "C4 · Coesão", nota: c4, dica: `${conectivos} conectivos utilizados.` },
    { nome: "C5 · Proposta de intervenção", nota: c5, dica: temProposta ? "Proposta identificada na conclusão." : "Nenhuma proposta de intervenção detectada." },
  ];

  return {
    conectivos,
    conectivosUsados,
    citacoes,
    periodos: sentences.length,
    mediaFrase,
    verbos,
    substantivos,
    adjetivos,
    pronomes,
    adverbios,
    argumentos,
    notaEstimada: c1 + c2 + c3 + c4 + c5,
    competencias,
  };
}
