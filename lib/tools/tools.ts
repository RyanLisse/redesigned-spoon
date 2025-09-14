import type { ToolsState } from "@/stores/useToolsStore";
import { toolsList } from "../../config/tools-list";

export const getTools = async (toolsState: ToolsState) => {
  const {
    fileSearchEnabled,
    functionsEnabled,
    vectorStore,
    mcpEnabled,
    mcpConfig,
  } = toolsState;

  const tools: any[] = [];

  // Always prefer file search when enabled and a vector store is configured
  if (fileSearchEnabled && vectorStore?.id) {
    tools.push({
      type: "file_search",
      vector_store_ids: [vectorStore.id],
    });
  }

  if (functionsEnabled) {
    tools.push(
      ...toolsList.map((tool) => {
        return {
          type: "function",
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            properties: { ...tool.parameters },
            required: Object.keys(tool.parameters),
            additionalProperties: false,
          },
          strict: true,
        };
      })
    );
  }

  if (mcpEnabled && mcpConfig.server_url && mcpConfig.server_label) {
    const mcpTool: any = {
      type: "mcp",
      server_label: mcpConfig.server_label,
      server_url: mcpConfig.server_url,
    };
    if (mcpConfig.skip_approval) {
      mcpTool.require_approval = "never";
    }
    if (mcpConfig.allowed_tools.trim()) {
      mcpTool.allowed_tools = mcpConfig.allowed_tools
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
    }
    tools.push(mcpTool);
  }

  return tools;
};
