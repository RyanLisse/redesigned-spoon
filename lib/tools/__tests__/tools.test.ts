import type { ToolsState } from "@/stores/useToolsStore";
import { getTools } from "../tools";

describe("getTools", () => {
  const baseToolsState: ToolsState = {
    functionsEnabled: false,
    fileSearchEnabled: false,
    vectorStore: { id: "", name: "" },
    mcpEnabled: false,
    mcpConfig: {
      server_label: "",
      server_url: "",
      allowed_tools: "",
      skip_approval: false,
    },
  };

  it("should return empty array when no tools are enabled", () => {
    const tools = getTools(baseToolsState);
    expect(tools).toEqual([]);
  });

  it("should include file_search function when vectorStore is configured", () => {
    const toolsState: ToolsState = {
      ...baseToolsState,
      vectorStore: { id: "vs_123", name: "Test Store" },
    };

    const tools = getTools(toolsState);
    expect(tools).toHaveLength(1);
    expect(tools[0]).toEqual({
      type: "function",
      function: {
        name: "file_search",
        description:
          "Search through uploaded files to find relevant information. Use this tool to answer questions based on the uploaded documents.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The search query to find relevant information in the uploaded files",
            },
            vector_store_id: {
              type: "string",
              description: "The vector store ID containing the files to search",
              const: "vs_123",
            },
          },
          required: ["query", "vector_store_id"],
          additionalProperties: false,
        },
        strict: true,
      },
    });
  });

  it("should not include function tools when toolsList is empty", () => {
    const toolsState: ToolsState = {
      ...baseToolsState,
      functionsEnabled: true,
    };

    const tools = getTools(toolsState);
    expect(tools).toEqual([]);
  });

  it("should not include MCP tools in OpenAI API tools (handled separately)", () => {
    const toolsState: ToolsState = {
      ...baseToolsState,
      mcpEnabled: true,
      mcpConfig: {
        server_label: "test-server",
        server_url: "http://localhost:3000",
        allowed_tools: "tool1,tool2",
        skip_approval: true,
      },
    };

    const tools = getTools(toolsState);
    // MCP tools are handled at application level, not passed to OpenAI API
    expect(tools).toHaveLength(0);
  });

  it("should include only OpenAI-compatible function tools", () => {
    const toolsState: ToolsState = {
      ...baseToolsState,
      vectorStore: { id: "vs_123", name: "Test Store" },
      mcpEnabled: true,
      mcpConfig: {
        server_label: "test-server",
        server_url: "http://localhost:3000",
        allowed_tools: "",
        skip_approval: false,
      },
    };

    const tools = getTools(toolsState);
    // Only file_search function tool should be returned (MCP handled separately)
    expect(tools).toHaveLength(1);
    expect(tools[0].type).toBe("function");
    expect(tools[0]).toHaveProperty("function");
    if (tools[0].type === "function") {
      expect(tools[0].function?.name).toBe("file_search");
    }
  });

  it("should return empty array when only MCP is enabled", () => {
    const toolsState: ToolsState = {
      ...baseToolsState,
      mcpEnabled: true,
      mcpConfig: {
        server_label: "test-server",
        server_url: "http://localhost:3000",
        allowed_tools: "",
        skip_approval: false,
      },
    };

    const tools = getTools(toolsState);
    // MCP tools are not included in OpenAI API tools
    expect(tools).toHaveLength(0);
  });
});
