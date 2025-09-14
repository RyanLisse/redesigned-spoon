import React from "react";
import { ToolCallItem } from "@/lib/assistant";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@/components/ai-elements/tool";

interface ToolCallProps {
  toolCall: ToolCallItem;
}

function mapState(status: ToolCallItem["status"]): "input-streaming" | "input-available" | "output-available" | "output-error" {
  switch (status) {
    case "in_progress":
    case "searching":
      return "input-available";
    case "completed":
      return "output-available";
    case "failed":
      return "output-error";
    default:
      return "input-streaming";
  }
}

export default function ToolCall({ toolCall }: ToolCallProps) {
  const state = mapState(toolCall.status);
  const typeLabel =
    toolCall.tool_type === "file_search_call"
      ? "file_search"
      : toolCall.tool_type === "mcp_call"
        ? `mcp:${toolCall.name ?? "tool"}`
        : `function:${toolCall.name ?? "call"}`;

  return (
    <div className="flex justify-start pt-2">
      <Tool>
        <ToolHeader state={state} type={typeLabel} />
        <ToolContent>
          {toolCall.parsedArguments ? (
            <ToolInput input={toolCall.parsedArguments} />
          ) : null}
          <ToolOutput errorText={state === "output-error" ? toolCall.output ?? null : null} output={toolCall.output ?? null} />
        </ToolContent>
      </Tool>
    </div>
  );
}
