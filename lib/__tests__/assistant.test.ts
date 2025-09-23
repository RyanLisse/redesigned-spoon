import { vi } from "vitest";
import type { Annotation } from "@/components/annotations";
import type { ContentItem, MessageItem, ToolCallItem } from "../assistant";
import { handleTurn, processMessages } from "../assistant";

// Mock the stores
vi.mock("@/stores/useConversationStore");
vi.mock("@/stores/useToolsStore");
vi.mock("@/stores/use-ui-store");
vi.mock("@/lib/tools/tools-handling");

describe("assistant utils", () => {
  describe("type definitions", () => {
    it("should define ContentItem correctly", () => {
      const contentItem: ContentItem = {
        type: "input_text",
        text: "Hello world",
        annotations: [
          {
            type: "file_citation",
            fileId: "file_123",
            filename: "test.txt",
            index: 0,
            title: "Test File",
          },
        ],
        reasoning: "This is reasoning text",
        reasoning_streaming: true,
      };

      expect(contentItem.type).toBe("input_text");
      expect(contentItem.text).toBe("Hello world");
      expect(contentItem.annotations).toHaveLength(1);
      expect(contentItem.reasoning).toBe("This is reasoning text");
      expect(contentItem.reasoning_streaming).toBe(true);
    });

    it("should define MessageItem correctly", () => {
      const messageItem: MessageItem = {
        type: "message",
        role: "assistant",
        id: "msg_123",
        content: [
          {
            type: "output_text",
            text: "Assistant response",
          },
        ],
      };

      expect(messageItem.type).toBe("message");
      expect(messageItem.role).toBe("assistant");
      expect(messageItem.id).toBe("msg_123");
      expect(messageItem.content).toHaveLength(1);
    });

    it("should define ToolCallItem correctly", () => {
      const toolCallItem: ToolCallItem = {
        type: "tool_call",
        tool_type: "file_search_call",
        status: "completed",
        id: "tool_123",
        name: "file_search",
        call_id: "call_456",
        arguments: '{"query": "test"}',
        parsedArguments: { query: "test" },
        output: "Search results",
        files: [
          {
            file_id: "file_789",
            mime_type: "text/plain",
            container_id: "container_101",
            filename: "result.txt",
          },
        ],
      };

      expect(toolCallItem.type).toBe("tool_call");
      expect(toolCallItem.tool_type).toBe("file_search_call");
      expect(toolCallItem.status).toBe("completed");
      expect(toolCallItem.files).toHaveLength(1);
    });

    it("should handle all content item types", () => {
      const types: ContentItem["type"][] = [
        "input_text",
        "output_text",
        "refusal",
        "output_audio",
      ];

      types.forEach((type) => {
        const contentItem: ContentItem = { type };
        expect(contentItem.type).toBe(type);
      });
    });

    it("should handle all tool call types", () => {
      const toolTypes: ToolCallItem["tool_type"][] = [
        "file_search_call",
        "function_call",
        "mcp_call",
      ];

      toolTypes.forEach((toolType) => {
        const toolCallItem: ToolCallItem = {
          type: "tool_call",
          tool_type: toolType,
          status: "in_progress",
          id: "test_id",
        };
        expect(toolCallItem.tool_type).toBe(toolType);
      });
    });

    it("should handle all tool call statuses", () => {
      const statuses: ToolCallItem["status"][] = [
        "in_progress",
        "completed",
        "failed",
        "searching",
      ];

      statuses.forEach((status) => {
        const toolCallItem: ToolCallItem = {
          type: "tool_call",
          tool_type: "function_call",
          status,
          id: "test_id",
        };
        expect(toolCallItem.status).toBe(status);
      });
    });

    it("should handle message roles", () => {
      const roles: MessageItem["role"][] = ["user", "assistant", "system"];

      roles.forEach((role) => {
        const messageItem: MessageItem = {
          type: "message",
          role,
          content: [],
        };
        expect(messageItem.role).toBe(role);
      });
    });

    it("should handle annotations correctly", () => {
      const annotation: Annotation = {
        type: "file_citation",
        fileId: "file_123",
        filename: "test.pdf",
        index: 0,
        title: "Test Document",
      };

      const contentItem: ContentItem = {
        type: "output_text",
        text: "Content with annotation",
        annotations: [annotation],
      };

      expect(contentItem.annotations).toHaveLength(1);
      expect(contentItem.annotations?.[0].type).toBe("file_citation");
      expect(contentItem.annotations?.[0].fileId).toBe("file_123");
    });

    it("should handle optional fields correctly", () => {
      const minimalContentItem: ContentItem = {
        type: "input_text",
      };

      const minimalMessageItem: MessageItem = {
        type: "message",
        role: "user",
        content: [],
      };

      const minimalToolCallItem: ToolCallItem = {
        type: "tool_call",
        tool_type: "function_call",
        status: "in_progress",
        id: "tool_id",
      };

      expect(minimalContentItem.type).toBe("input_text");
      expect(minimalMessageItem.role).toBe("user");
      expect(minimalToolCallItem.tool_type).toBe("function_call");
    });

    it("should handle complex nested structures", () => {
      const complexMessage: MessageItem = {
        type: "message",
        role: "assistant",
        id: "complex_msg",
        content: [
          {
            type: "output_text",
            text: "Here's the analysis:",
            annotations: [
              {
                type: "file_citation",
                fileId: "file_1",
                filename: "data.csv",
                index: 0,
              },
              {
                type: "url_citation",
                url: "https://example.com",
                title: "External Source",
                index: 1,
              },
            ],
            reasoning: "Based on the data analysis...",
            reasoning_streaming: false,
          },
          {
            type: "output_text",
            text: "Additional information:",
          },
        ],
      };

      expect(complexMessage.content).toHaveLength(2);
      expect(complexMessage.content[0].annotations).toHaveLength(2);
      expect(complexMessage.content[0].reasoning).toBeDefined();
    });
  });

  describe("function exports", () => {
    it("should export required functions", () => {
      // Test that the functions are properly typed and exported
      expect(typeof handleTurn).toBe("function"); // Exported function
      expect(typeof processMessages).toBe("function"); // Exported function
    });

    it("should handle type validation", () => {
      // Ensure types compile correctly
      const item: ToolCallItem = {
        type: "tool_call",
        tool_type: "mcp_call",
        status: "completed",
        id: "mcp_123",
        name: "mcp_tool",
        arguments: '{"param": "value"}',
        parsedArguments: { param: "value" },
        output: "MCP result",
      };

      expect(item.tool_type).toBe("mcp_call");
      expect(item.parsedArguments).toEqual({ param: "value" });
    });
  });
});
