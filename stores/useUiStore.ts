import { create } from "zustand";

export type ReasoningEffort = "low" | "medium" | "high";

interface UiState {
  modelId: string;
  reasoningEffort: ReasoningEffort;
  setModelId: (id: string) => void;
  setReasoningEffort: (effort: ReasoningEffort) => void;
}

const useUiStore = create<UiState>((set) => ({
  modelId: "gpt-5-mini",
  reasoningEffort: "medium",
  setModelId: (id) => set({ modelId: id }),
  setReasoningEffort: (effort) => set({ reasoningEffort: effort }),
}));

export default useUiStore;
