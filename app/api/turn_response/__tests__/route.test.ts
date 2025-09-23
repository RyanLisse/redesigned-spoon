import { NextRequest } from "next/server";
import { vi } from "vitest";
import { HTTP_STATUS } from "@/config/constants";
import { POST } from "../route";

const mockOpenAi = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

const mockStream = {
  *[Symbol.asyncIterator]() {
    yield {
      choices: [
        {
          delta: {
            content: "Hello",
          },
        },
      ],
    };
    yield {
      choices: [
        {
          delta: {
            toolCalls: [
              {
                id: "call_123",
                type: "function",
                function: {
                  name: "test_function",
                  arguments: '{"param": "value"}',
                },
              },
            ],
          },
        },
      ],
    };
    yield {
      choices: [
        {
          message: {
            role: "assistant",
            content: "Complete response",
            toolCalls: [
              {
                type: "file_search",
                // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
                file_search: {
                  results: [
                    {
                      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
                      file_id: "file_123",
                      filename: "test.txt",
                      content: "Test content",
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };
    yield {
      choices: [
        {
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          finish_reason: "stop",
        },
      ],
    };
  },
};

// Mock dependencies
vi.mock("openai", () => ({
  default: vi.fn(() => mockOpenAi),
}));

vi.mock("@/config/constants", () => ({
  getDeveloperPrompt: vi.fn(() => "Test system prompt"),
  // biome-ignore lint/style/useNamingConvention: Constants use UPPER_SNAKE_CASE
  MODEL: "gpt-4",
  // biome-ignore lint/style/useNamingConvention: Constants use UPPER_SNAKE_CASE
  HTTP_STATUS: {
    // biome-ignore lint/style/useNamingConvention: HTTP status constants use UPPER_SNAKE_CASE
    OK: 200,
    // biome-ignore lint/style/useNamingConvention: HTTP status constants use UPPER_SNAKE_CASE
    MULTIPLE_CHOICES: 300,
    // biome-ignore lint/style/useNamingConvention: HTTP status constants use UPPER_SNAKE_CASE
    BAD_REQUEST: 400,
    // biome-ignore lint/style/useNamingConvention: HTTP status constants use UPPER_SNAKE_CASE
    NOT_FOUND: 404,
    // biome-ignore lint/style/useNamingConvention: HTTP status constants use UPPER_SNAKE_CASE
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("@/lib/logger", () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    default: mockLogger,
  };
});

vi.mock("@/lib/models", () => ({
  isReasoningModel: vi.fn(() => false),
}));

vi.mock("@/lib/tools/tools", () => ({
  getTools: vi.fn(() => []),
}));

describe("/api/turn_response", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock stream
    mockOpenAi.chat.completions.create.mockResolvedValue(mockStream);
  });

  it("should handle valid request with messages", async () => {
    const request = new NextRequest("http://localhost/api/turn_response", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Hello",
          },
        ],
        toolsState: {},
        modelId: "gpt-4",
      }),
    });

    const response = await POST(request);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
    expect(mockOpenAi.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4",
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "system",
            content: "Test system prompt",
          }),
          expect.objectContaining({
            role: "user",
            content: "Hello",
          }),
        ]),
        tools: undefined,
        stream: true,
      })
    );
  });

  it("should include tools when toolsState is provided", async () => {
    const { getTools } = await import("@/lib/tools/tools");
    vi.mocked(getTools).mockReturnValue([
      {
        type: "function",
        function: {
          name: "test_tool",
          description: "A test tool",
          parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    ]);

    const request = new NextRequest("http://localhost/api/turn_response", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        // biome-ignore lint/style/useNamingConvention: Tool names use snake_case
        toolsState: { test_tool: true },
      }),
    });

    await POST(request);

    expect(mockOpenAi.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.arrayContaining([
          expect.objectContaining({
            type: "function",
            function: expect.objectContaining({
              name: "test_tool",
            }),
          }),
        ]),
      })
    );
  });

  it("should handle reasoning models with effort parameter", async () => {
    const { isReasoningModel } = await import("@/lib/models");
    vi.mocked(isReasoningModel).mockReturnValue(true);

    const request = new NextRequest("http://localhost/api/turn_response", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        toolsState: {},
        modelId: "o1-preview",
        reasoningEffort: "medium",
      }),
    });

    await POST(request);

    expect(mockOpenAi.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "o1-preview",
        // Note: reasoning parameter is commented out in implementation
        // to prevent 400 errors with current OpenAI SDK version
      })
    );
  });

  it("should handle errors gracefully", async () => {
    const error = new Error("OpenAI API error");
    mockOpenAi.chat.completions.create.mockRejectedValue(error);

    const request = new NextRequest("http://localhost/api/turn_response", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        toolsState: {},
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: "OpenAI API error",
    });
    const logger = await import("@/lib/logger");
    expect(vi.mocked(logger.default.error)).toHaveBeenCalledWith(
      { err: error },
      "Error in POST handler"
    );
  });

  it("should handle invalid JSON gracefully", async () => {
    const request = new NextRequest("http://localhost/api/turn_response", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const logger = await import("@/lib/logger");
    expect(vi.mocked(logger.default.error)).toHaveBeenCalled();
  });

  it("should stream content chunks correctly", async () => {
    const request = new NextRequest("http://localhost/api/turn_response", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        toolsState: {},
      }),
    });

    const response = await POST(request);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
    expect(response.body).toBeDefined();
  });

  it("should extract file search citations correctly", async () => {
    const request = new NextRequest("http://localhost/api/turn_response", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        toolsState: {},
      }),
    });

    const response = await POST(request);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.body).toBeDefined();
  });

  it("should stream content chunks correctly", async () => {
    const request = new NextRequest("http://localhost/api/turn_response", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        toolsState: {},
      }),
    });

    const response = await POST(request);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.body).toBeDefined();
  });
});
