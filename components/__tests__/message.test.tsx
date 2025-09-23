import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { MessageItem } from "@/lib/assistant";
import Message from "../message";

// Mock the annotations component
vi.mock("../annotations", () => ({
  default({ annotations }: { annotations: any[] }) {
    return (
      <div data-testid="annotations">
        {annotations.map((annotation, index) => (
          <div data-testid={`annotation-${index}`} key={index}>
            {annotation.title}
          </div>
        ))}
      </div>
    );
  },
}));

// Mock the reasoning component
vi.mock("../ai-elements/reasoning", () => ({
  default({ content }: { content: string }) {
    return <div data-testid="reasoning">{content}</div>;
  },
}));

// Mock the response component
vi.mock("../ai-elements/response", () => ({
  Response({ children }: { children: React.ReactNode }) {
    return <div data-testid="response">{children}</div>;
  },
}));

// Mock the chain-of-thought components
vi.mock("../ai-elements/chain-of-thought", () => ({
  ChainOfThought({ children }: { children: React.ReactNode }) {
    return <div data-testid="chain-of-thought">{children}</div>;
  },
  ChainOfThoughtContent({ children }: { children: React.ReactNode }) {
    return <div data-testid="chain-of-thought-content">{children}</div>;
  },
  ChainOfThoughtHeader({ children }: { children: React.ReactNode }) {
    return <div data-testid="chain-of-thought-header">{children}</div>;
  },
  ChainOfThoughtSummary({ reasoningSummary }: { reasoningSummary: any }) {
    const content = reasoningSummary?.steps?.[0]?.content || "";
    return <div data-testid="chain-of-thought-summary">{content}</div>;
  },
}));

describe("Message", () => {
  it("should render user message", () => {
    const userMessage: MessageItem = {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: "Hello, how are you?",
        },
      ],
    };

    render(<Message message={userMessage} />);

    expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
    expect(screen.getByTestId("message-user")).toBeInTheDocument();
  });

  it("should render assistant message", () => {
    const assistantMessage: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "I'm doing well, thank you!",
        },
      ],
    };

    render(<Message message={assistantMessage} />);

    expect(screen.getByText("I'm doing well, thank you!")).toBeInTheDocument();
    expect(screen.getByTestId("message-assistant")).toBeInTheDocument();
  });

  it("should render system message", () => {
    const systemMessage: MessageItem = {
      type: "message",
      role: "system",
      content: [
        {
          type: "input_text",
          text: "You are a helpful assistant.",
        },
      ],
    };

    render(<Message message={systemMessage} />);

    expect(
      screen.getByText("You are a helpful assistant.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("message-system")).toBeInTheDocument();
  });

  it("should render message with annotations", () => {
    const messageWithAnnotations: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "Based on the document, here's the answer.",
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

    render(<Message message={messageWithAnnotations} />);

    expect(
      screen.getByText("Based on the document, here's the answer.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("annotations")).toBeInTheDocument();
    expect(screen.getByTestId("annotation-0")).toBeInTheDocument();
    expect(screen.getByText("Important Document")).toBeInTheDocument();
  });

  it("should render message with reasoning", () => {
    const messageWithReasoning: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "Here's my analysis.",
          reasoning: "First, I need to analyze the problem...",
        },
      ],
    };

    render(<Message message={messageWithReasoning} />);

    expect(screen.getByText("Here's my analysis.")).toBeInTheDocument();
    expect(screen.getByTestId("chain-of-thought")).toBeInTheDocument();
    expect(
      screen.getByText("First, I need to analyze the problem...")
    ).toBeInTheDocument();
  });

  it("should render message with streaming reasoning", () => {
    const messageWithStreamingReasoning: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "Thinking...",
          reasoning: "Let me think about this step by step...",
          reasoning_streaming: true,
        },
      ],
    };

    render(<Message message={messageWithStreamingReasoning} />);

    expect(screen.getByText("Thinking...")).toBeInTheDocument();
    expect(screen.getByTestId("chain-of-thought")).toBeInTheDocument();
    expect(
      screen.getByText("Let me think about this step by step...")
    ).toBeInTheDocument();
  });

  it("should render multiple content items", () => {
    const messageWithMultipleContent: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "First part of the response.",
        },
        {
          type: "output_text",
          text: "Second part of the response.",
        },
      ],
    };

    render(<Message message={messageWithMultipleContent} />);

    expect(screen.getByText("First part of the response.")).toBeInTheDocument();
    expect(
      screen.getByText("Second part of the response.")
    ).toBeInTheDocument();
  });

  it("should handle message with empty text", () => {
    const messageWithEmptyText: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "",
        },
      ],
    };

    render(<Message message={messageWithEmptyText} />);

    expect(screen.getByTestId("message-assistant")).toBeInTheDocument();
  });

  it("should handle message with no content", () => {
    const messageWithNoContent: MessageItem = {
      type: "message",
      role: "assistant",
      content: [],
    };

    render(<Message message={messageWithNoContent} />);

    expect(screen.getByTestId("message-assistant")).toBeInTheDocument();
  });

  it("should handle refusal content type", () => {
    const messageWithRefusal: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "refusal",
          text: "I cannot help with that request.",
        },
      ],
    };

    render(<Message message={messageWithRefusal} />);

    expect(
      screen.getByText("I cannot help with that request.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("message-assistant")).toBeInTheDocument();
  });

  it("should handle output_audio content type", () => {
    const messageWithAudio: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_audio",
          text: "Audio content placeholder",
        },
      ],
    };

    render(<Message message={messageWithAudio} />);

    expect(screen.getByText("Audio content placeholder")).toBeInTheDocument();
    expect(screen.getByTestId("message-assistant")).toBeInTheDocument();
  });

  it("should apply correct CSS classes for different roles", () => {
    const userMessage: MessageItem = {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: "User message" }],
    };

    const assistantMessage: MessageItem = {
      type: "message",
      role: "assistant",
      content: [{ type: "output_text", text: "Assistant message" }],
    };

    const systemMessage: MessageItem = {
      type: "message",
      role: "system",
      content: [{ type: "input_text", text: "System message" }],
    };

    const { rerender } = render(<Message message={userMessage} />);
    expect(screen.getByTestId("message-user")).toHaveClass("message-user");

    rerender(<Message message={assistantMessage} />);
    expect(screen.getByTestId("message-assistant")).toHaveClass(
      "message-assistant"
    );

    rerender(<Message message={systemMessage} />);
    expect(screen.getByTestId("message-system")).toHaveClass("message-system");
  });

  it("should handle message with ID", () => {
    const messageWithId: MessageItem = {
      type: "message",
      role: "assistant",
      id: "msg_123",
      content: [
        {
          type: "output_text",
          text: "Message with ID",
        },
      ],
    };

    render(<Message message={messageWithId} />);

    expect(screen.getByText("Message with ID")).toBeInTheDocument();
    expect(screen.getByTestId("message-assistant")).toHaveAttribute(
      "data-message-id",
      "msg_123"
    );
  });

  it("should handle complex annotations with missing fields", () => {
    const messageWithIncompleteAnnotations: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "Response with incomplete annotations.",
          annotations: [
            {
              type: "file_citation",
              fileId: "file_456",
              index: 0,
              title: "Incomplete Annotation",
              // Missing filename and content
            },
          ],
        },
      ],
    };

    render(<Message message={messageWithIncompleteAnnotations} />);

    expect(
      screen.getByText("Response with incomplete annotations.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("annotations")).toBeInTheDocument();
    expect(screen.getByText("Incomplete Annotation")).toBeInTheDocument();
  });

  it("should be accessible with proper semantic structure", () => {
    const message: MessageItem = {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "Accessible message",
        },
      ],
    };

    render(<Message message={message} />);

    const messageElement = screen.getByTestId("message-assistant");
    expect(messageElement).toHaveAttribute("role", "article");
    expect(messageElement).toHaveAttribute(
      "aria-label",
      expect.stringContaining("assistant")
    );
  });
});
