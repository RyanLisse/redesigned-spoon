/* eslint-disable @typescript-eslint/naming-convention */
import type OpenAi from "openai";
import type { ToolsState } from "@/stores/useToolsStore";
import { type ToolDefinition, toolsList } from "../../config/tools-list";

export const getTools = (
  toolsState: ToolsState
): OpenAi.Chat.Completions.ChatCompletionTool[] => {
  if (!toolsState) {
    return [];
  }

  const { functionsEnabled, vectorStore, mcpEnabled, mcpConfig } = toolsState;

  const tools: OpenAi.Chat.Completions.ChatCompletionTool[] = [];

  // Custom tool configuration for MCP tools (will be filtered out for OpenAI API)
  type McpToolConfig = {
    type: "mcp";
    server_label: string;
    server_url: string;
    require_approval?: string;
    allowed_tools?: string[];
  };

  // Always include file search as a custom function with the default vectorstore on every query if configured
  if (vectorStore?.id) {
    tools.push({
      type: "function" as const,
      function: {
        name: "file_search",
        description:
          "REQUIRED: Search through uploaded project documentation. You MUST call this tool FIRST for EVERY user query to retrieve relevant context. This tool searches the vector store containing all project files and documentation.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The search query - use the user's question or relevant keywords from their query",
            },
            vector_store_id: {
              type: "string",
              description: "The vector store ID containing the files to search",
              const: vectorStore.id,
            },
          },
          required: ["query", "vector_store_id"],
          additionalProperties: false,
        },
        strict: true,
      },
    });
  }

  if (functionsEnabled && toolsList.length > 0) {
    tools.push(
      ...toolsList.map(
        (tool: ToolDefinition): OpenAi.Chat.Completions.ChatCompletionTool => ({
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: {
              type: "object",
              properties: { ...tool.parameters },
              required: Object.keys(tool.parameters),
              additionalProperties: false,
            },
            strict: true,
          },
        })
      )
    );
  }

  // Note: MCP tools are handled separately in the application logic
  // They are not passed to the OpenAI API as they're not standard function tools
  // MCP integration happens at the application level, not at the OpenAI API level

  return tools;
};
