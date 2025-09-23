/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* biome-ignore lint: correct */
import type { ToolsState } from "@/stores/useToolsStore";
import { toolsList } from "../../config/tools-list";

export const getTools = (toolsState: ToolsState) => {
  const { functionsEnabled, vectorStore, mcpEnabled, mcpConfig } = toolsState;

  const tools: any[] = [];

  // Always include file search with the default vectorstore on every query if configured
  if (vectorStore?.id) {
    tools.push({
      type: "file_search",
      vector_store_ids: [vectorStore.id],
    });
  }

  if (functionsEnabled) {
    tools.push(
      ...toolsList.map((tool) => ({
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
      }))
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
