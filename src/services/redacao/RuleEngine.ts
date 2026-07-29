/** Banco de regras linguísticas do corretor (sem IA). */

export interface RegexRule {
  id: string;
  pattern: string;
  flags?: string;
  message: string;
  replacement: string;
  type: "gramatica" | "pontuacao" | "sugestao";
}

/* Pleonasmos e redundâncias */
export const REDUNDANCIAS: RegexRule[] = [
  ["subir para cima", "subir", "Pleonasmo: subir já indica ir para cima."],
  ["descer para baixo", "descer", "Pleonasmo: descer já indica ir para baixo."],
  ["entrar para dentro", "entrar", "Pleonasmo: entrar já indica ir para dentro."],
  ["sair para fora", "sair", "Pleonasmo: sair já indica ir para fora."],
  ["elo de ligação", "elo", "Pleonasmo: elo já significa ligação."],
  ["há anos atrás", "há anos", "Redundância: 'há' já indica tempo passado."],
  ["há dias atrás", "há dias", "Redundância: 'há' já indica tempo passado."],
  ["há tempos atrás", "há tempos", "Redundância: 'há' já indica tempo passado."],
  ["mais melhor", "melhor", "'Melhor' já é o comparativo de 'bom'."],
  ["menos pior", "pior", "'Pior' já é o comparativo de 'mau'."],
  ["mais pior", "pior", "'Pior' já é o comparativo de 'mau'."],
  ["encarar de frente", "encarar", "Pleonasmo."],
  ["planejar antecipadamente", "planejar", "Pleonasmo."],
  ["repetir de novo", "repetir", "Pleonasmo."],
  ["certeza absoluta", "certeza", "Redundância."],
  ["surpresa inesperada", "surpresa", "Redundância."],
  ["monopólio exclusivo", "monopólio", "Redundância."],
  ["consenso geral", "consenso", "Redundância."],
  ["multidão de pessoas", "multidão", "Redundância."],
  ["breve resumo", "resumo", "Redundância."],
  ["criar novo", "criar", "Redundância."],
  ["metade da metade", "um quarto", "Provável redundância."],
  ["conviver junto", "conviver", "Pleonasmo."],
  ["adiar para depois", "adiar", "Pleonasmo."],
  ["fato real", "fato", "Redundância."],
  ["principal protagonista", "protagonista", "Redundância."],
].map(([pattern, replacement, message], i) => ({
  id: `red-${i}`,
  pattern: `\\b${pattern.replace(/ /g, "\\s+")}\\b`,
  flags: "gi",
  message,
  replacement,
  type: "gramatica" as const,
}));

/* Concordância e erros comuns */
export const CONCORDANCIA: RegexRule[] = [
  { id: "con-1", pattern: "\\ba\\s+gente\\s+(fomos|vamos ser|somos|fizemos|estamos indo)\\b", message: "Concordância: 'a gente' pede verbo na 3ª pessoa do singular.", replacement: "a gente foi", type: "gramatica" },
  { id: "con-2", pattern: "\\ba\\s+gente\\s+fomos\\b", message: "Use 'a gente foi'.", replacement: "a gente foi", type: "gramatica" },
  { id: "con-3", pattern: "\\bhouveram\\b", message: "'Haver' no sentido de existir é impessoal: use 'houve'.", replacement: "houve", type: "gramatica" },
  { id: "con-4", pattern: "\\bhaviam\\s+(muitos|muitas|várias|vários|pessoas)\\b", message: "'Haver' no sentido de existir é impessoal: use 'havia'.", replacement: "havia", type: "gramatica" },
  { id: "con-5", pattern: "\\bexistem\\s+há\\b", message: "Evite 'existem há'; prefira 'existem desde'.", replacement: "existem desde", type: "sugestao" },
  { id: "con-6", pattern: "\\bmenas\\b", message: "A palavra 'menas' não existe. Use 'menos'.", replacement: "menos", type: "gramatica" },
  { id: "con-7", pattern: "\\bpara\\s+mim\\s+(fazer|ver|comer|estudar|escrever|falar|ir|ter)\\b", message: "Antes de verbo no infinitivo, use 'para eu'.", replacement: "para eu $1", type: "gramatica" },
  { id: "con-8", pattern: "\\bfazem\\s+(\\d+|muitos|vários)\\s+(anos|meses|dias|semanas)\\b", message: "'Fazer' indicando tempo é impessoal: use 'faz'.", replacement: "faz $1 $2", type: "gramatica" },
  { id: "con-9", pattern: "\\bde\\s+encontro\\s+a(o|os|s)?\\b", message: "'De encontro a' significa colisão. Para concordar, use 'ao encontro de'.", replacement: "ao encontro de", type: "sugestao" },
  { id: "con-10", pattern: "\\bmau\\s+(feito|educado|humorado)\\b", message: "Antes de adjetivo/particípio use 'mal'.", replacement: "mal $1", type: "gramatica" },
  { id: "con-11", pattern: "\\bem\\s+vez\\s+em\\s+quando\\b", message: "O correto é 'de vez em quando'.", replacement: "de vez em quando", type: "gramatica" },
  { id: "con-12", pattern: "\\bao\\s+invés\\s+disso\\b", message: "'Ao invés' indica oposição. Para alternativa, use 'em vez disso'.", replacement: "em vez disso", type: "sugestao" },
  { id: "con-13", pattern: "\\bmais\\s+(nada|ninguém|nunca)\\b", message: "Em contexto negativo, o correto é 'mas' → prefira 'não … nada'.", replacement: "mais $1", type: "sugestao" },
  { id: "con-14", pattern: "\\bonde\\s+que\\b", message: "Evite 'onde que'. Use apenas 'onde'.", replacement: "onde", type: "gramatica" },
  { id: "con-15", pattern: "\\bseje\\b", message: "A forma correta é 'seja'.", replacement: "seja", type: "gramatica" },
  { id: "con-16", pattern: "\\bpobrema\\b|\\bproblemas?\\s+de\\s+pobrema\\b", message: "Forma incorreta de 'problema'.", replacement: "problema", type: "gramatica" },
  { id: "con-17", pattern: "\\bimprevisto\\s+inesperado\\b", message: "Redundância.", replacement: "imprevisto", type: "gramatica" },
  { id: "con-18", pattern: "\\bà\\s+partir\\b", message: "O correto é 'a partir' (sem crase).", replacement: "a partir", type: "gramatica" },
  { id: "con-19", pattern: "\\ba\\s+medida\\s+que\\b", message: "O correto é 'à medida que' (proporção).", replacement: "à medida que", type: "gramatica" },
  { id: "con-20", pattern: "\\bem\\s+princípio\\s+de\\s+tudo\\b", message: "Prefira 'a princípio'.", replacement: "a princípio", type: "sugestao" },
];

/* Plural: artigo plural + substantivo singular */
export const ARTIGOS_PLURAIS = ["as", "os", "esses", "essas", "estes", "estas", "muitos", "muitas", "vários", "várias", "alguns", "algumas", "dois", "duas", "três", "todos", "todas"];

/* Informalidades / marcas de oralidade (proibidas no ENEM) */
export const INFORMALIDADES: RegexRule[] = [
  ["pra", "para"], ["pro", "para o"], ["tá", "está"], ["tô", "estou"], ["né", "não é"],
  ["vc", "você"], ["vcs", "vocês"], ["tbm", "também"], ["pq", "porque"], ["q", "que"],
  ["cê", "você"], ["mto", "muito"], ["blz", "beleza"], ["msm", "mesmo"], ["hj", "hoje"],
  ["a gente", "nós"], ["coisa", "aspecto/fator"], ["coisas", "aspectos/fatores"],
  ["muito bom", "extremamente positivo"], ["um monte de", "grande quantidade de"],
  ["tipo assim", "por exemplo"], ["daí", "em seguida"], ["aí", "então"],
].map(([pattern, replacement], i) => ({
  id: `inf-${i}`,
  pattern: `\\b${pattern.replace(/ /g, "\\s+")}\\b`,
  flags: "gi",
  message: `Linguagem informal: prefira "${replacement}" na redação do ENEM.`,
  replacement,
  type: "sugestao" as const,
}));

/* Marcas de 1ª pessoa (desaconselhadas na dissertação) */
export const PRIMEIRA_PESSOA: RegexRule[] = [
  ["eu acho", "considera-se"], ["eu penso", "entende-se"], ["eu acredito", "acredita-se"],
  ["na minha opinião", "sob essa ótica"], ["eu vejo", "observa-se"], ["acho que", "infere-se que"],
  ["nós devemos", "é necessário"], ["a meu ver", "nesse sentido"],
].map(([pattern, replacement], i) => ({
  id: `pp-${i}`,
  pattern: `\\b${pattern.replace(/ /g, "\\s+")}\\b`,
  flags: "gi",
  message: `Evite 1ª pessoa na dissertação. Prefira "${replacement}".`,
  replacement,
  type: "sugestao" as const,
}));

/* Conectivos valorizados no ENEM */
export const CONECTIVOS = [
  "além disso", "ademais", "outrossim", "portanto", "entretanto", "contudo", "todavia",
  "no entanto", "por conseguinte", "em síntese", "assim", "logo", "dessa forma",
  "desse modo", "nesse sentido", "sob essa ótica", "por outro lado", "em contrapartida",
  "primeiramente", "posteriormente", "por fim", "conclui-se", "diante disso",
  "haja vista", "visto que", "uma vez que", "porquanto", "conquanto", "embora",
  "apesar de", "consequentemente", "com efeito", "sobretudo", "inclusive", "ou seja",
  "isto é", "por exemplo", "em suma", "finalmente", "similarmente", "analogamente",
  "enquanto isso", "nesse ínterim", "segundo", "conforme", "de acordo com", "porém",
  "porque", "pois", "já que", "a fim de", "para que", "caso", "se", "mas", "e", "ou",
];

/* Repertório sociocultural (indicador de citação) */
export const MARCADORES_CITACAO = [
  "segundo", "conforme", "de acordo com", "afirma", "afirmou", "defende", "defendeu",
  "como aponta", "segundo dados", "ibge", "onu", "unesco", "oms", "constituição",
  "constituição federal", "artigo", "filósofo", "sociólogo", "escritor", "autor",
  "obra", "romance", "segundo o", "para o filósofo", "segundo a pesquisa",
];

/* Nomes próprios que devem começar com maiúscula */
export const NOMES_PROPRIOS = [
  "brasil", "portugal", "argentina", "estados unidos", "frança", "alemanha", "japão",
  "china", "índia", "canadá", "méxico", "chile", "uruguai", "paraguai", "bolívia",
  "são paulo", "rio de janeiro", "minas gerais", "bahia", "paraná", "pernambuco",
  "ceará", "goiás", "amazonas", "brasília", "salvador", "recife", "fortaleza",
  "curitiba", "porto alegre", "belo horizonte", "manaus", "belém", "natal",
  "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto",
  "setembro", "outubro", "novembro", "dezembro",
  "natal", "carnaval", "páscoa", "tiradentes", "ibge", "onu", "unesco", "oms", "enem",
  "sus", "constituição federal", "kant", "platão", "aristóteles", "sócrates",
  "zygmunt bauman", "michel foucault", "hannah arendt", "paulo freire", "milton santos",
  "darcy ribeiro", "machado de assis", "josé de alencar",
];

/* Classes gramaticais aproximadas por sufixo (análise sem IA) */
export const SUFIXOS = {
  substantivo: ["ção", "ções", "dade", "dades", "mento", "mentos", "agem", "ismo", "ista", "ência", "ância", "eza", "tude", "ura", "or", "ores"],
  adjetivo: ["ável", "ível", "oso", "osa", "osos", "osas", "al", "ais", "ivo", "iva", "ivos", "ivas", "ante", "ente", "ico", "ica", "icos", "icas"],
  verbo: ["ar", "er", "ir", "ou", "am", "em", "ndo", "ado", "ada", "ados", "adas", "ido", "ida", "aram", "eram", "ará", "erá", "irá", "aria", "eria"],
  adverbio: ["mente"],
};

export const PRONOMES = [
  "eu", "tu", "ele", "ela", "nós", "vós", "eles", "elas", "me", "te", "se", "nos", "vos",
  "lhe", "lhes", "meu", "minha", "seu", "sua", "nosso", "nossa", "este", "esta", "esse",
  "essa", "aquele", "aquela", "isso", "isto", "aquilo", "que", "quem", "qual", "cujo",
  "cuja", "onde", "o", "a", "os", "as",
];
