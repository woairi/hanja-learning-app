export interface Hanja {
  grade: string;
  reading: string;
  character: string;
  meaning: string;
}

export interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  answer: string;
  character: string;
}

export interface AnswerResult {
  is_correct: boolean;
  score: number;
  similarity?: number;
}

export type Grade = "준8급" | "8급" | "준7급" | "7급" | "준6급" | "6급" | "준5급" | "5급" | "준4급" | "4급";