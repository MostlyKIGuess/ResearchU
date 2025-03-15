export type ResearchStatus = "idle" | "loading" | "success" | "error";

export interface LogEntry {
  level: string;
  message: string;
}

export interface SeedPaper {
  title: string;
  url?: string;
  authors?: string;
  year?: number;
}

export interface ResearchResults {
  paper?: {
    title: string;
    content: string;
    references: number;
  };
  implementation?: {
    code?: string;
    refined_code?: string;
  };
}
