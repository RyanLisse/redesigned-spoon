import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { ToolCallItem } from "@/lib/assistant";

type ToolCallProps = {
  toolCall: ToolCallItem;
};

function mapState(
  status: ToolCallItem["status"]
): "input-streaming" | "input-available" | "output-available" | "output-error" {
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
  const typeLabel: `tool-${string}` =
    toolCall.tool_type === "file_search_call"
      ? "tool-file_search"
      : toolCall.tool_type === "mcp_call"
        ? `tool-mcp:${toolCall.name ?? "tool"}`
        : `tool-function:${toolCall.name ?? "call"}`;

  return (
    <div className="flex justify-start pt-2">
      <Tool>
        <ToolHeader state={state} type={typeLabel} />
        <ToolContent>
          {toolCall.parsedArguments ? (
            <ToolInput input={toolCall.parsedArguments} />
          ) : null}
          <ToolOutput
            errorText={
              state === "output-error"
                ? (toolCall.output ?? undefined)
                : undefined
            }
            output={toolCall.output ?? undefined}
          />
        </ToolContent>
      </Tool>
    </div>
  );
}
