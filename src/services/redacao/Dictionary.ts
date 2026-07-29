import { normalize } from "@/utils/text";

/**
 * Dicionário pt-BR offline (~306 mil palavras).
 * O arquivo público usa codificação por prefixo compartilhado:
 * cada linha = [1 char base36 = nº de chars herdados da linha anterior] + resto.
 */

const DICT_URL = "/dict-pt-br.txt";
const PERSONAL_KEY = "focoleve:dicionario-pessoal";
const B36 = "0123456789abcdefghijklmnopqrstuvwxyz";

export interface DictionaryData {
  words: Set<string>;
  /** sem acentos -> forma correta acentuada */
  deaccent: Map<string, string>;
  /** "primeira letra + tamanho" -> palavras */
  buckets: Map<string, string[]>;
}

let cache: DictionaryData | null = null;
let loading: Promise<DictionaryData> | null = null;

function decode(raw: string): string[] {
  const lines = raw.split("\n");
  const out: string[] = new Array(lines.length);
  let prev = "";
  let n = 0;
  for (const line of lines) {
    if (!line) continue;
    const shared = B36.indexOf(line[0]);
    if (shared < 0) continue;
    const word = prev.slice(0, shared) + line.slice(1);
    out[n++] = word;
    prev = word;
  }
  out.length = n;
  return out;
}

function build(words: string[]): DictionaryData {
  const set = new Set<string>(words);
  const deaccent = new Map<string, string>();
  const buckets = new Map<string, string[]>();
  for (const w of words) {
    const na = normalize(w);
    if (na !== w && !deaccent.has(na)) deaccent.set(na, w);
    const key = w[0] + ":" + w.length;
    const arr = buckets.get(key);
    if (arr) arr.push(w);
    else buckets.set(key, [w]);
  }
  return { words: set, deaccent, buckets };
}

export function loadDictionary(): Promise<DictionaryData> {
  if (cache) return Promise.resolve(cache);
  if (loading) return loading;
  loading = fetch(DICT_URL)
    .then((r) => r.text())
    .then((raw) => {
      cache = build(decode(raw));
      return cache;
    });
  return loading;
}

export function getDictionary(): DictionaryData | null {
  return cache;
}

/* ───────── Dicionário pessoal ───────── */

export function getPersonalWords(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PERSONAL_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addPersonalWord(word: string): void {
  const w = word.toLowerCase();
  const list = getPersonalWords();
  if (!list.includes(w)) {
    list.push(w);
    localStorage.setItem(PERSONAL_KEY, JSON.stringify(list));
  }
  cache?.words.add(w);
}

export function removePersonalWord(word: string): void {
  const list = getPersonalWords().filter((w) => w !== word);
  localStorage.setItem(PERSONAL_KEY, JSON.stringify(list));
}

/** Palavras muito frequentes — usadas para ranquear sugestões. */
export const COMMON_WORDS = new Set<string>(
  `de a o que e do da em um para com não uma os no se na por mais as dos como mas ao ele das seu sua ou quando muito nos já eu também só pelo pela até isso ela entre depois sem mesmo aos seus quem nas me esse eles você essa num nem suas meu às minha numa pelos elas qual será nós lhe deles essas esses pelas este dele tu te vocês vos lhes meus minhas teu tua teus tuas nosso nossa nossos nossas dela delas esta estes estas aquele aquela aqueles aquelas isto aquilo estou está estamos estão estive esteve estivemos estiveram era éramos eram fui foi fomos foram seja sejam somos são sou tem têm tinha tinham tenho temos tive teve haver há sociedade brasil brasileira brasileiro governo população direito educação saúde problema questão forma modo maneira sentido ainda assim portanto contudo entretanto todavia além disso porém logo então cada todos toda todas outro outra outros outras grande maior pequeno melhor pior novo nova primeiro segundo terceiro país estado cidade mundo vida tempo ano anos dia dias pessoa pessoas trabalho meio meios social sociais público pública políticas política cultura cultural história desenvolvimento processo importante necessário fundamental possível preciso dessa desse nesse nessa nesta neste`
    .split(/\s+/)
    .filter(Boolean),
);
