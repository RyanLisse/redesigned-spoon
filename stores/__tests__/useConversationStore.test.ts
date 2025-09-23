import { act, renderHook } from "@testing-library/react";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { Item, MessageItem } from "@/lib/assistant";
import useConversationStore from "../useConversationStore";

describe("useConversationStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useConversationStore());
    act(() => {
      result.current.resetConversation();
    });
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useConversationStore());

    expect(result.current.chatMessages).toEqual([]);
    expect(result.current.conversationItems).toEqual([]);
    expect(result.current.isAssistantLoading).toBe(false);
  });

  it("should set chat messages", () => {
    const { result } = renderHook(() => useConversationStore());

    const messages: Item[] = [
      {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Hello",
          },
        ],
      },
      {
        type: "message",
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: "Hi there!",
          },
        ],
      },
    ];

    act(() => {
      result.current.setChatMessages(messages);
    });

    expect(result.current.chatMessages).toEqual(messages);
    expect(result.current.chatMessages).toHaveLength(2);
  });

  it("should set conversation items", () => {
    const { result } = renderHook(() => useConversationStore());

    const conversationItems: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: "Hello",
      },
      {
        role: "assistant",
        content: "Hi there!",
      },
    ];

    act(() => {
      result.current.setConversationItems(conversationItems);
    });

    expect(result.current.conversationItems).toEqual(conversationItems);
    expect(result.current.conversationItems).toHaveLength(2);
  });

  it("should add chat message", () => {
    const { result } = renderHook(() => useConversationStore());

    const message1: Item = {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: "First message",
        },
      ],
    };

    const message2: Item = {
      type: "tool_call",
      tool_type: "file_search_call",
      status: "completed",
      id: "tool_1",
    };

    act(() => {
      result.current.addChatMessage(message1);
    });

    expect(result.current.chatMessages).toHaveLength(1);
    expect(result.current.chatMessages[0]).toEqual(message1);

    act(() => {
      result.current.addChatMessage(message2);
    });

    expect(result.current.chatMessages).toHaveLength(2);
    expect(result.current.chatMessages[1]).toEqual(message2);
  });

  it("should add conversation item", () => {
    const { result } = renderHook(() => useConversationStore());

    const message1: ChatCompletionMessageParam = {
      role: "user",
      content: "First message",
    };

    const message2: ChatCompletionMessageParam = {
      role: "assistant",
      content: "Response message",
    };

    act(() => {
      result.current.addConversationItem(message1);
    });

    expect(result.current.conversationItems).toHaveLength(1);
    expect(result.current.conversationItems[0]).toEqual(message1);

    act(() => {
      result.current.addConversationItem(message2);
    });

    expect(result.current.conversationItems).toHaveLength(2);
    expect(result.current.conversationItems[1]).toEqual(message2);
  });

  it("should set assistant loading state", () => {
    const { result } = renderHook(() => useConversationStore());

    expect(result.current.isAssistantLoading).toBe(false);

    act(() => {
      result.current.setAssistantLoading(true);
    });

    expect(result.current.isAssistantLoading).toBe(true);

    act(() => {
      result.current.setAssistantLoading(false);
    });

    expect(result.current.isAssistantLoading).toBe(false);
  });

  it("should allow raw state updates", () => {
    const { result } = renderHook(() => useConversationStore());

    const newState = {
      chatMessages: [
        {
          type: "message" as const,
          role: "user" as const,
          content: [
            {
              type: "input_text" as const,
              text: "Raw update message",
            },
          ],
        },
      ],
      isAssistantLoading: true,
    };

    act(() => {
      result.current.rawSet(newState);
    });

    expect(result.current.chatMessages).toEqual(newState.chatMessages);
    expect(result.current.isAssistantLoading).toBe(true);
  });

  it("should reset conversation", () => {
    const { result } = renderHook(() => useConversationStore());

    // Add some data first
    act(() => {
      result.current.addChatMessage({
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "Test" }],
      });
      result.current.addConversationItem({
        role: "user",
        content: "Test",
      });
      result.current.setAssistantLoading(true);
    });

    expect(result.current.chatMessages).toHaveLength(1);
    expect(result.current.conversationItems).toHaveLength(1);
    expect(result.current.isAssistantLoading).toBe(true);

    // Reset conversation
    act(() => {
      result.current.resetConversation();
    });

    expect(result.current.chatMessages).toEqual([]);
    expect(result.current.conversationItems).toEqual([]);
    // Note: resetConversation doesn't reset isAssistantLoading
    expect(result.current.isAssistantLoading).toBe(true);
  });

  it("should handle complex message types", () => {
    const { result } = renderHook(() => useConversationStore());

    const complexMessage: Item = {
      type: "message",
      role: "assistant",
      id: "msg_123",
      content: [
        {
          type: "output_text",
          text: "Here's the search result:",
          annotations: [
            {
              type: "file_citation",
              fileId: "file_123",
              filename: "document.pdf",
              index: 0,
              title: "Important Document",
            },
          ],
        },
      ],
    };

    act(() => {
      result.current.addChatMessage(complexMessage);
    });

    expect(result.current.chatMessages[0]).toEqual(complexMessage);
    expect(
      (result.current.chatMessages[0] as MessageItem).content[0].annotations
    ).toHaveLength(1);
  });

  it("should maintain immutability when adding messages", () => {
    const { result } = renderHook(() => useConversationStore());

    const message1: Item = {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: "Message 1" }],
    };

    act(() => {
      result.current.addChatMessage(message1);
    });

    const firstState = result.current.chatMessages;

    const message2: Item = {
      type: "message",
      role: "assistant",
      content: [{ type: "output_text", text: "Message 2" }],
    };

    act(() => {
      result.current.addChatMessage(message2);
    });

    const secondState = result.current.chatMessages;

    expect(firstState).not.toBe(secondState);
    expect(firstState).toHaveLength(1);
    expect(secondState).toHaveLength(2);
  });

  it("should handle tool call items", () => {
    const { result } = renderHook(() => useConversationStore());

    const toolCallItem: Item = {
      type: "tool_call",
      tool_type: "function_call",
      status: "in_progress",
      id: "tool_123",
      name: "get_weather",
      call_id: "call_456",
      arguments: '{"location": "New York"}',
      parsedArguments: { location: "New York" },
    };

    act(() => {
      result.current.addChatMessage(toolCallItem);
    });

    expect(result.current.chatMessages[0]).toEqual(toolCallItem);
    expect(result.current.chatMessages[0].type).toBe("tool_call");
  });

  it("should handle MCP list tools items", () => {
    const { result } = renderHook(() => useConversationStore());

    const mcpItem: Item = {
      type: "mcp_list_tools",
      id: "mcp_123",
      server_label: "test_server",
      tools: [
        {
          name: "file_read",
          description: "Read file contents",
        },
      ],
    };

    act(() => {
      result.current.addChatMessage(mcpItem);
    });

    expect(result.current.chatMessages[0]).toEqual(mcpItem);
    expect(result.current.chatMessages[0].type).toBe("mcp_list_tools");
  });
});
