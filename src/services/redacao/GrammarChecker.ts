import {
  ARTIGOS_PLURAIS,
  CONCORDANCIA,
  INFORMALIDADES,
  NOMES_PROPRIOS,
  PRIMEIRA_PESSOA,
  REDUNDANCIAS,
  type RegexRule,
} from "@/services/redacao/RuleEngine";
import type { Issue } from "@/services/redacao/types";
import { normalize, splitSentences, tokenize } from "@/utils/text";

function applyRules(text: string, rules: RegexRule[], out: Issue[]) {
  for (const rule of rules) {
    const re = new RegExp(rule.pattern, rule.flags || "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (!m[0].trim()) {
        re.lastIndex++;
        continue;
      }
      const replacement = m[0].replace(re.source ? new RegExp(rule.pattern, rule.flags?.replace("g", "") || "i") : re, rule.replacement);
      out.push({
        id: `${rule.id}-${m.index}`,
        type: rule.type,
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        message: rule.message,
        suggestions: [replacement],
      });
    }
  }
}

/* ───────── Gramática ───────── */
export function checkGrammar(text: string): Issue[] {
  const issues: Issue[] = [];
  applyRules(text, REDUNDANCIAS, issues);
  applyRules(text, CONCORDANCIA, issues);
  applyRules(text, INFORMALIDADES, issues);
  applyRules(text, PRIMEIRA_PESSOA, issues);

  // Artigo plural + substantivo singular ("as criança")
  const artigos = ARTIGOS_PLURAIS.join("|");
  const plural = new RegExp(`\\b(${artigos})\\s+([a-zà-öø-ÿ]{3,})\\b`, "gi");
  let m: RegExpExecArray | null;
  while ((m = plural.exec(text)) !== null) {
    const noun = m[2].toLowerCase();
    if (noun.endsWith("s") || noun.endsWith("z") || noun.endsWith("r") || noun.endsWith("m")) continue;
    if (["mais", "muito", "bem", "não", "que", "para", "como", "quando", "então"].includes(noun)) continue;
    const fixed = noun.endsWith("ão")
      ? noun.slice(0, -2) + "ões"
      : noun.endsWith("l")
        ? noun.slice(0, -1) + "is"
        : noun + "s";
    issues.push({
      id: `plu-${m.index}`,
      type: "gramatica",
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      message: `Concordância de número: "${m[1]} ${noun}" → "${m[1]} ${fixed}".`,
      suggestions: [`${m[1]} ${fixed}`],
    });
  }

  // Letras repetidas (noooossa, ameiiii)
  const rep = /\b[a-zà-öø-ÿ]*([a-zà-öø-ÿ])\1{2,}[a-zà-öø-ÿ]*\b/gi;
  while ((m = rep.exec(text)) !== null) {
    const fixed = m[0].replace(/([a-zà-öø-ÿ])\1{2,}/gi, "$1");
    issues.push({
      id: `let-${m.index}`,
      type: "gramatica",
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      message: "Letras repetidas em excesso.",
      suggestions: [fixed],
    });
  }

  return issues;
}

/* ───────── Pontuação e maiúsculas ───────── */
export function checkPunctuation(text: string): Issue[] {
  const issues: Issue[] = [];
  const push = (i: Omit<Issue, "type"> & { type?: Issue["type"] }) =>
    issues.push({ ...i, type: i.type || "pontuacao" } as Issue);

  let m: RegExpExecArray | null;

  // Pontuação duplicada
  const dup = /([,;:.!?])\1+/g;
  while ((m = dup.exec(text)) !== null) {
    push({ id: `dup-${m.index}`, start: m.index, end: m.index + m[0].length, text: m[0], message: "Pontuação repetida.", suggestions: [m[1]] });
  }

  // Espaço antes de pontuação
  const spBefore = /\s+([,;:.!?])/g;
  while ((m = spBefore.exec(text)) !== null) {
    push({ id: `spb-${m.index}`, start: m.index, end: m.index + m[0].length, text: m[0], message: "Não use espaço antes da pontuação.", suggestions: [m[1]] });
  }

  // Espaços duplos
  const dbl = / {2,}/g;
  while ((m = dbl.exec(text)) !== null) {
    push({ id: `dsp-${m.index}`, start: m.index, end: m.index + m[0].length, text: m[0], message: "Espaço duplo.", suggestions: [" "] });
  }

  // Falta de espaço depois da vírgula/ponto
  const noSp = /([,;:])(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g;
  while ((m = noSp.exec(text)) !== null) {
    push({ id: `nsp-${m.index}`, start: m.index, end: m.index + 1, text: m[0], message: "Falta espaço após a pontuação.", suggestions: [m[1] + " "] });
  }

  // Quebras de linha em excesso
  const brs = /\n{3,}/g;
  while ((m = brs.exec(text)) !== null) {
    push({ id: `br-${m.index}`, start: m.index, end: m.index + m[0].length, text: "quebras", message: "Quebras de linha em excesso.", suggestions: ["\n\n"] });
  }

  const sentences = splitSentences(text);
  sentences.forEach((s, idx) => {
    const words = tokenize(s.text);

    // Frase muito longa
    if (words.length > 40) {
      push({
        id: `long-${s.start}`,
        type: "sugestao",
        start: s.start,
        end: s.end,
        text: s.text.slice(0, 60) + "…",
        message: `Frase muito longa (${words.length} palavras). Divida em períodos menores.`,
        suggestions: [],
      });
    }

    // Falta de ponto final na última frase
    if (idx === sentences.length - 1 && words.length > 3 && !/[.!?…]$/.test(s.text)) {
      push({
        id: `nofim-${s.start}`,
        start: s.end - 1,
        end: s.end,
        text: s.text.slice(-10),
        message: "A frase não termina com ponto final.",
        suggestions: [s.text.slice(-10) + "."],
      });
    }

    // Primeira letra maiúscula
    const first = words[0];
    if (first && /^[a-zà-öø-ÿ]/.test(first.text)) {
      push({
        id: `cap-${s.start}`,
        type: "gramatica",
        start: s.start + (first.start - s.start),
        end: first.end,
        text: first.text,
        message: "A frase deve começar com letra maiúscula.",
        suggestions: [first.text[0].toUpperCase() + first.text.slice(1)],
      });
    }
  });

  // Nomes próprios em minúscula
  for (const nome of NOMES_PROPRIOS) {
    const re = new RegExp(`(^|[^A-Za-zÀ-ÖØ-öø-ÿ])(${nome})(?![A-Za-zÀ-ÖØ-öø-ÿ])`, "g");
    while ((m = re.exec(text)) !== null) {
      const start = m.index + m[1].length;
      const fixed = nome
        .split(" ")
        .map((p) => (p.length <= 2 ? p : p[0].toUpperCase() + p.slice(1)))
        .join(" ");
      push({
        id: `np-${start}`,
        type: "gramatica",
        start,
        end: start + m[2].length,
        text: m[2],
        message: `Nome próprio: escreva "${fixed}" com inicial maiúscula.`,
        suggestions: [fixed],
      });
    }
  }

  return issues;
}

/* ───────── Repetição de palavras ───────── */
const STOP = new Set(
  "de a o que e do da em um uma para com não os as no na se por mais ao dos das como mas ou nos à às pelo pela é ser são foi era seu sua isso esse essa este esta lhe entre até já também".split(" "),
);

export function checkRepetition(text: string, windowSize = 60): Issue[] {
  const tokens = tokenize(text);
  const issues: Issue[] = [];
  const seen = new Map<string, number[]>();

  tokens.forEach((t, i) => {
    const key = normalize(t.text);
    if (key.length < 4 || STOP.has(key)) return;
    const list = seen.get(key) || [];
    list.push(i);
    seen.set(key, list);
  });

  for (const [word, idxs] of seen) {
    if (idxs.length < 3) continue;
    for (let i = 0; i + 2 < idxs.length; i++) {
      if (idxs[i + 2] - idxs[i] <= windowSize) {
        const t = tokens[idxs[i + 2]];
        issues.push({
          id: `rep-${t.start}`,
          type: "repeticao",
          start: t.start,
          end: t.end,
          text: t.text,
          message: `A palavra "${word}" aparece muitas vezes em um trecho curto. Use sinônimos.`,
          suggestions: [],
        });
        break;
      }
    }
  }
  return issues;
}
