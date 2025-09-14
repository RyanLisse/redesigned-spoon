import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultVectorStore } from "@/config/constants";

type File = {
  id: string;
  name: string;
  content: string;
};

type VectorStore = {
  id: string;
  name: string;
  files?: File[];
};

export type McpConfig = {
  server_label: string;
  server_url: string;
  allowed_tools: string;
  skip_approval: boolean;
};

export interface ToolsState {
  fileSearchEnabled: boolean;
  functionsEnabled: boolean;
  vectorStore: VectorStore;
  mcpEnabled: boolean;
  mcpConfig: McpConfig;
}

interface StoreState {
  fileSearchEnabled: boolean;
  //previousFileSearchEnabled: boolean;
  setFileSearchEnabled: (enabled: boolean) => void;
  functionsEnabled: boolean;
  //previousFunctionsEnabled: boolean;
  setFunctionsEnabled: (enabled: boolean) => void;
  vectorStore: VectorStore | null;
  setVectorStore: (store: VectorStore) => void;
  mcpEnabled: boolean;
  setMcpEnabled: (enabled: boolean) => void;
  mcpConfig: McpConfig;
  setMcpConfig: (config: McpConfig) => void;
}

const useToolsStore = create<StoreState>()(
  persist(
    (set) => ({
      vectorStore: defaultVectorStore.id !== "" ? defaultVectorStore : null,
      mcpConfig: {
        server_label: "",
        server_url: "",
        allowed_tools: "",
        skip_approval: true,
      },
      fileSearchEnabled: true,
      previousFileSearchEnabled: false,
      setFileSearchEnabled: (enabled) => {
        set({ fileSearchEnabled: enabled });
      },
      functionsEnabled: true,
      previousFunctionsEnabled: true,
      setFunctionsEnabled: (enabled) => {
        set({ functionsEnabled: enabled });
      },
      mcpEnabled: false,
      setMcpEnabled: (enabled) => {
        set({ mcpEnabled: enabled });
      },
      setVectorStore: (store) => set({ vectorStore: store }),
      setMcpConfig: (config) => set({ mcpConfig: config }),
    }),
    {
      name: "tools-store",
    }
  )
);

export default useToolsStore;
