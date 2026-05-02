const BASE_URL = "https://api.enem.dev/v1";

export interface EnemQuestion {
  title: string;
  index: number;
  discipline: string;
  language?: string;
  year: number;
  context: string | null;
  files: string[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: {
    letter: string;
    text: string;
    file: string | null;
    isCorrect: boolean;
  }[];
}

export interface EnemExam {
  title: string;
  year: number;
  disciplines: { label: string; value: string }[];
}

export interface QuestionsResponse {
  metadata: { limit: number; offset: number; total: number; hasMore: boolean };
  questions: EnemQuestion[];
}

export const DISCIPLINE_MAP: Record<string, string> = {
  "matematica": "Matemática",
  "linguagens": "Linguagens",
  "ciencias-natureza": "Ciências da Natureza",
  "ciencias-humanas": "Ciências Humanas",
};

export const DISCIPLINE_KEYS = Object.keys(DISCIPLINE_MAP);

export async function fetchExams(): Promise<EnemExam[]> {
  const res = await fetch(`${BASE_URL}/exams`);
  if (!res.ok) throw new Error("Erro ao buscar provas");
  return res.json();
}

export async function fetchQuestions(
  year: number,
  limit = 45,
  offset = 0
): Promise<QuestionsResponse> {
  const res = await fetch(
    `${BASE_URL}/exams/${year}/questions?limit=${limit}&offset=${offset}`
  );
  if (!res.ok) throw new Error("Erro ao buscar questões");
  return res.json();
}

export async function fetchQuestionsByDiscipline(
  year: number,
  discipline: string,
  limit = 10
): Promise<EnemQuestion[]> {
  // API doesn't filter by discipline, so we fetch a large batch and filter
  const res = await fetch(
    `${BASE_URL}/exams/${year}/questions?limit=180&offset=0`
  );
  if (!res.ok) throw new Error("Erro ao buscar questões");
  const data: QuestionsResponse = await res.json();
  return data.questions
    .filter((q) => q.discipline === discipline)
    .slice(0, limit);
}
