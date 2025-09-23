import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import useToolsStore, { type McpConfig } from "../useToolsStore";

// Mock the constants
vi.mock("@/config/constants", () => ({
  defaultVectorStore: {
    id: "default_vs",
    name: "Default Vector Store",
  },
}));

describe("useToolsStore", () => {
  beforeEach(() => {
    // Reset store to default state
    const { result } = renderHook(() => useToolsStore());
    act(() => {
      result.current.setFileSearchEnabled(true);
      result.current.setFunctionsEnabled(true);
      result.current.setMcpEnabled(false);
      result.current.setMcpConfig({
        server_label: "",
        server_url: "",
        allowed_tools: "",
        skip_approval: true,
      });
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useToolsStore());

    expect(result.current.fileSearchEnabled).toBe(true);
    expect(result.current.functionsEnabled).toBe(true);
    expect(result.current.mcpEnabled).toBe(false);
    expect(result.current.vectorStore).toEqual({
      id: "default_vs",
      name: "Default Vector Store",
    });
    expect(result.current.mcpConfig).toEqual({
      server_label: "",
      server_url: "",
      allowed_tools: "",
      skip_approval: true,
    });
  });

  it("should toggle file search enabled state", () => {
    const { result } = renderHook(() => useToolsStore());

    expect(result.current.fileSearchEnabled).toBe(true);

    act(() => {
      result.current.setFileSearchEnabled(false);
    });

    expect(result.current.fileSearchEnabled).toBe(false);

    act(() => {
      result.current.setFileSearchEnabled(true);
    });

    expect(result.current.fileSearchEnabled).toBe(true);
  });

  it("should toggle functions enabled state", () => {
    const { result } = renderHook(() => useToolsStore());

    expect(result.current.functionsEnabled).toBe(true);

    act(() => {
      result.current.setFunctionsEnabled(false);
    });

    expect(result.current.functionsEnabled).toBe(false);

    act(() => {
      result.current.setFunctionsEnabled(true);
    });

    expect(result.current.functionsEnabled).toBe(true);
  });

  it("should toggle MCP enabled state", () => {
    const { result } = renderHook(() => useToolsStore());

    expect(result.current.mcpEnabled).toBe(false);

    act(() => {
      result.current.setMcpEnabled(true);
    });

    expect(result.current.mcpEnabled).toBe(true);

    act(() => {
      result.current.setMcpEnabled(false);
    });

    expect(result.current.mcpEnabled).toBe(false);
  });

  it("should update vector store", () => {
    const { result } = renderHook(() => useToolsStore());

    const newVectorStore = {
      id: "new_vs",
      name: "New Vector Store",
      files: [
        {
          id: "file_1",
          name: "test.txt",
          content: "Test content",
        },
      ],
    };

    act(() => {
      result.current.setVectorStore(newVectorStore);
    });

    expect(result.current.vectorStore).toEqual(newVectorStore);
  });

  it("should update MCP config", () => {
    const { result } = renderHook(() => useToolsStore());

    const newMcpConfig: McpConfig = {
      server_label: "Test Server",
      server_url: "http://localhost:3001",
      allowed_tools: "tool1,tool2,tool3",
      skip_approval: false,
    };

    act(() => {
      result.current.setMcpConfig(newMcpConfig);
    });

    expect(result.current.mcpConfig).toEqual(newMcpConfig);
  });

  it("should handle multiple state updates", () => {
    const { result } = renderHook(() => useToolsStore());

    act(() => {
      result.current.setFileSearchEnabled(false);
      result.current.setFunctionsEnabled(false);
      result.current.setMcpEnabled(true);
    });

    expect(result.current.fileSearchEnabled).toBe(false);
    expect(result.current.functionsEnabled).toBe(false);
    expect(result.current.mcpEnabled).toBe(true);
  });

  it("should handle empty vector store", () => {
    const { result } = renderHook(() => useToolsStore());

    const emptyVectorStore = {
      id: "empty_vs",
      name: "Empty Vector Store",
    };

    act(() => {
      result.current.setVectorStore(emptyVectorStore);
    });

    expect(result.current.vectorStore).toEqual(emptyVectorStore);
    expect(result.current.vectorStore?.files).toBeUndefined();
  });

  it("should handle MCP config with empty values", () => {
    const { result } = renderHook(() => useToolsStore());

    const emptyMcpConfig: McpConfig = {
      server_label: "",
      server_url: "",
      allowed_tools: "",
      skip_approval: true,
    };

    act(() => {
      result.current.setMcpConfig(emptyMcpConfig);
    });

    expect(result.current.mcpConfig).toEqual(emptyMcpConfig);
  });

  it("should maintain state independence", () => {
    const { result } = renderHook(() => useToolsStore());

    // Change only file search
    act(() => {
      result.current.setFileSearchEnabled(false);
    });

    expect(result.current.fileSearchEnabled).toBe(false);
    expect(result.current.functionsEnabled).toBe(true); // Should remain unchanged
    expect(result.current.mcpEnabled).toBe(false); // Should remain unchanged

    // Change only functions
    act(() => {
      result.current.setFunctionsEnabled(false);
    });

    expect(result.current.fileSearchEnabled).toBe(false); // Should remain changed
    expect(result.current.functionsEnabled).toBe(false);
    expect(result.current.mcpEnabled).toBe(false); // Should remain unchanged
  });

  it("should handle complex vector store with multiple files", () => {
    const { result } = renderHook(() => useToolsStore());

    const complexVectorStore = {
      id: "complex_vs",
      name: "Complex Vector Store",
      files: [
        {
          id: "file_1",
          name: "document1.pdf",
          content: "Content of document 1",
        },
        {
          id: "file_2",
          name: "document2.txt",
          content: "Content of document 2",
        },
        {
          id: "file_3",
          name: "spreadsheet.xlsx",
          content: "Content of spreadsheet",
        },
      ],
    };

    act(() => {
      result.current.setVectorStore(complexVectorStore);
    });

    expect(result.current.vectorStore).toEqual(complexVectorStore);
    expect(result.current.vectorStore?.files).toHaveLength(3);
  });

  it("should handle MCP config with complex allowed tools", () => {
    const { result } = renderHook(() => useToolsStore());

    const complexMcpConfig: McpConfig = {
      server_label: "Production Server",
      server_url: "https://api.example.com/mcp",
      allowed_tools:
        "file_read,file_write,database_query,api_call,system_command",
      skip_approval: false,
    };

    act(() => {
      result.current.setMcpConfig(complexMcpConfig);
    });

    expect(result.current.mcpConfig).toEqual(complexMcpConfig);
    expect(result.current.mcpConfig.allowed_tools.split(",")).toHaveLength(5);
  });

  it("should work with TypeScript types correctly", () => {
    const { result } = renderHook(() => useToolsStore());

    // These should compile without TypeScript errors
    const fileSearchEnabled: boolean = result.current.fileSearchEnabled;
    const functionsEnabled: boolean = result.current.functionsEnabled;
    const mcpEnabled: boolean = result.current.mcpEnabled;
    const vectorStore = result.current.vectorStore;
    const mcpConfig: McpConfig = result.current.mcpConfig;

    expect(typeof fileSearchEnabled).toBe("boolean");
    expect(typeof functionsEnabled).toBe("boolean");
    expect(typeof mcpEnabled).toBe("boolean");
    expect(typeof mcpConfig.skip_approval).toBe("boolean");
    expect(vectorStore).toBeTruthy();
  });

  it("should persist state across multiple hook instances", () => {
    const { result: result1 } = renderHook(() => useToolsStore());
    const { result: result2 } = renderHook(() => useToolsStore());

    // Both hooks should reference the same store
    expect(result1.current.fileSearchEnabled).toBe(
      result2.current.fileSearchEnabled
    );
    expect(result1.current.functionsEnabled).toBe(
      result2.current.functionsEnabled
    );

    // Update from first hook
    act(() => {
      result1.current.setFileSearchEnabled(false);
    });

    // Second hook should see the update
    expect(result2.current.fileSearchEnabled).toBe(false);

    // Update from second hook
    act(() => {
      result2.current.setMcpEnabled(true);
    });

    // First hook should see the update
    expect(result1.current.mcpEnabled).toBe(true);
  });
});
