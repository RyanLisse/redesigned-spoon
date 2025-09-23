"use client";

import { Code } from "lucide-react";
import {
  type ToolDefinition,
  type ToolParameter,
  toolsList,
} from "@/config/tools-list";

const getToolArgs = (parameters: {
  [key: string]: ToolParameter | undefined;
}) => (
  <div className="ml-4">
    {Object.entries(parameters).map(([key, value]) => (
      <div className="my-1 flex items-center space-x-2 text-xs" key={key}>
        <span className="text-blue-500">{key}:</span>
        <span className="text-zinc-400">{value?.type}</span>
      </div>
    ))}
  </div>
);

export default function FunctionsView() {
  if (toolsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 py-8 text-center">
        <Code className="text-zinc-400" size={24} />
        <p className="text-sm text-zinc-500">No function tools configured</p>
        <p className="text-xs text-zinc-400">
          Function tools can be added in config/tools-list.ts
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {toolsList.map((tool: ToolDefinition) => (
        <div className="flex items-start gap-2" key={tool.name}>
          <div className="rounded-md bg-blue-100 p-1 text-blue-500">
            <Code size={16} />
          </div>
          <div className="mt-0.5 font-mono text-sm text-zinc-800">
            {tool.name}(
            {tool.parameters && Object.keys(tool.parameters).length > 0
              ? getToolArgs(tool.parameters)
              : ""}
            )
          </div>
        </div>
      ))}
    </div>
  );
}
