export type ModelInfo = {
  id: string;
  label?: string;
  reasoning?: boolean;
};

// Default list; in production you can fetch dynamically from OpenAI if desired.
export const MODELS: ModelInfo[] = [
  { id: "gpt-4.1", label: "GPT-4.1", reasoning: false },
  { id: "gpt-5", label: "GPT-5", reasoning: false },
  { id: "gpt-5-mini", label: "GPT-5 Mini", reasoning: true },
  { id: "gpt-5-nano", label: "GPT-5 Nano", reasoning: true },
  { id: "gpt-4o-mini", label: "GPT-4o mini", reasoning: false },
];

export const isReasoningModel = (id: string) =>
  MODELS.find((m) => m.id === id)?.reasoning === true;
