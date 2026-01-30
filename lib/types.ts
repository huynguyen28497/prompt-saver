export interface PromptEntry {
  id: string;
  /** The actual prompt text */
  content: string;
  /** Short title for quick reference */
  title: string;
  /** When/where this prompt was used */
  context?: string;
  /** Additional notes or description */
  description?: string;
  /** Tags for categorization (e.g. "coding", "writing") */
  tags: string[];
  /** Which AI tool was used (e.g. ChatGPT, Cursor, Claude) */
  aiTool?: string;
  /** What task or outcome was achieved */
  useCase?: string;
  /** Effectiveness rating 1-5, optional */
  rating?: number;
  /** Timestamp when captured */
  createdAt: string;
  /** Last updated */
  updatedAt: string;
  /** Whether content was extracted from image via OCR */
  fromImage?: boolean;
}

export type PromptFormData = Omit<PromptEntry, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
