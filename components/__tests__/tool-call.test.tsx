import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { ToolCallItem } from "@/lib/assistant";
import ToolCall from "../tool-call";

// Mock the UI components
vi.mock("../ai-elements/tool", () => ({
  Tool: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tool">{children}</div>
  ),
  ToolHeader: ({ type, state }: { type: string; state: string }) => (
    <div data-testid="tool-header">
      <span data-testid="tool-type">{type}</span>
      <span data-testid="tool-state">{state}</span>
    </div>
  ),
  ToolContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tool-content">{children}</div>
  ),
  ToolInput: ({ input }: { input: any }) => (
    <div data-testid="tool-input">{JSON.stringify(input)}</div>
  ),
  ToolOutput: ({ output, errorText }: { output?: any; errorText?: any }) => (
    <div data-testid="tool-output">
      {errorText && <span data-testid="error-text">{errorText}</span>}
      {output && <span data-testid="output-text">{output}</span>}
    </div>
  ),
}));

describe("ToolCall", () => {
  const baseToolCall: ToolCallItem = {
    type: "tool_call",
    tool_type: "function_call",
    status: "in_progress",
    id: "test-id",
    name: "testFunction",
    arguments: '{"param": "value"}',
    parsedArguments: { param: "value" },
    output: null,
  };

  it("should render function call tool correctly", () => {
    render(<ToolCall toolCall={baseToolCall} />);

    expect(screen.getByTestId("tool")).toBeInTheDocument();
    expect(screen.getByTestId("tool-header")).toBeInTheDocument();
    expect(screen.getByTestId("tool-type")).toHaveTextContent(
      "tool-function:testFunction"
    );
    expect(screen.getByTestId("tool-state")).toHaveTextContent(
      "input-available"
    );
  });

  it("should render file search tool correctly", () => {
    const fileSearchTool: ToolCallItem = {
      ...baseToolCall,
      tool_type: "file_search_call",
      name: null,
    };

    render(<ToolCall toolCall={fileSearchTool} />);

    expect(screen.getByTestId("tool-type")).toHaveTextContent(
      "tool-file_search"
    );
  });

  it("should render MCP tool correctly", () => {
    const mcpTool: ToolCallItem = {
      ...baseToolCall,
      tool_type: "mcp_call",
      name: "mcpTool",
    };

    render(<ToolCall toolCall={mcpTool} />);

    expect(screen.getByTestId("tool-type")).toHaveTextContent(
      "tool-mcp:mcpTool"
    );
  });

  it("should map status correctly", () => {
    const statuses: Array<{
      status: ToolCallItem["status"];
      expected: string;
    }> = [
      { status: "in_progress", expected: "input-available" },
      { status: "searching", expected: "input-available" },
      { status: "completed", expected: "output-available" },
      { status: "failed", expected: "output-error" },
    ];

    statuses.forEach(({ status, expected }) => {
      const { rerender } = render(
        <ToolCall toolCall={{ ...baseToolCall, status }} />
      );
      expect(screen.getByTestId("tool-state")).toHaveTextContent(expected);
      rerender(<div />);
    });
  });

  it("should render input when parsedArguments are available", () => {
    render(<ToolCall toolCall={baseToolCall} />);

    expect(screen.getByTestId("tool-input")).toBeInTheDocument();
    expect(screen.getByTestId("tool-input")).toHaveTextContent(
      '{"param":"value"}'
    );
  });

  it("should not render input when parsedArguments are null", () => {
    const toolCallWithoutArgs: ToolCallItem = {
      ...baseToolCall,
      parsedArguments: null,
    };

    render(<ToolCall toolCall={toolCallWithoutArgs} />);

    expect(screen.queryByTestId("tool-input")).not.toBeInTheDocument();
  });

  it("should render error output for failed tools", () => {
    const failedTool: ToolCallItem = {
      ...baseToolCall,
      status: "failed",
      output: "Error occurred",
    };

    render(<ToolCall toolCall={failedTool} />);

    expect(screen.getByTestId("tool-output")).toBeInTheDocument();
    expect(screen.getByTestId("error-text")).toHaveTextContent(
      "Error occurred"
    );
  });

  it("should render success output for completed tools", () => {
    const completedTool: ToolCallItem = {
      ...baseToolCall,
      status: "completed",
      output: "Success result",
    };

    render(<ToolCall toolCall={completedTool} />);

    expect(screen.getByTestId("tool-output")).toBeInTheDocument();
    expect(screen.getByTestId("output-text")).toHaveTextContent(
      "Success result"
    );
  });

  it("should handle tools with undefined names", () => {
    const toolWithoutName: ToolCallItem = {
      ...baseToolCall,
      name: undefined,
    };

    render(<ToolCall toolCall={toolWithoutName} />);

    expect(screen.getByTestId("tool-type")).toHaveTextContent(
      "tool-function:call"
    );
  });

  it("should handle tools with null names", () => {
    const toolWithNullName: ToolCallItem = {
      ...baseToolCall,
      name: null,
    };

    render(<ToolCall toolCall={toolWithNullName} />);

    expect(screen.getByTestId("tool-type")).toHaveTextContent(
      "tool-function:call"
    );
  });
});
