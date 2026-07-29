export type IssueType =
  | "ortografia"
  | "gramatica"
  | "pontuacao"
  | "repeticao"
  | "sugestao";

export interface Issue {
  id: string;
  type: IssueType;
  start: number;
  end: number;
  text: string;
  message: string;
  suggestions: string[];
}

export interface Token {
  text: string;
  start: number;
  end: number;
}

export interface Sentence {
  text: string;
  start: number;
  end: number;
}

export const ISSUE_META: Record<
  IssueType,
  { label: string; color: string; underline: string; badge: string }
> = {
  ortografia: {
    label: "Ortografia",
    color: "text-destructive",
    underline: "decoration-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
  gramatica: {
    label: "Gramática",
    color: "text-warning",
    underline: "decoration-warning",
    badge: "bg-warning/10 text-warning",
  },
  pontuacao: {
    label: "Pontuação",
    color: "text-warning",
    underline: "decoration-warning",
    badge: "bg-warning/10 text-warning",
  },
  repeticao: {
    label: "Repetições",
    color: "text-accent",
    underline: "decoration-accent",
    badge: "bg-accent/10 text-accent",
  },
  sugestao: {
    label: "Sugestões",
    color: "text-primary",
    underline: "decoration-primary",
    badge: "bg-primary/10 text-primary",
  },
};
