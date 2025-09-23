"use client";
import { ChevronRight, Code } from "lucide-react";
import { useState } from "react";
import type { McpListToolsItem } from "@/lib/assistant";

type Props = {
  item: McpListToolsItem;
};

export default function McpToolsList({ item }: Props) {
  function ToolDescription({ description }: { description: string }) {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="mt-1 flex items-start gap-2">
        <div
          className={
            "whitespace-pre-wrap text-xs text-zinc-500 transition-all duration-200" +
            (expanded ? "line-clamp-none" : "line-clamp-1 overflow-hidden")
          }
          style={{ maxWidth: 400 }}
        >
          {description}
        </div>
        <div
          className="flex cursor-pointer select-none items-center text-gray-500 text-xs focus:outline-hidden"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <ChevronRight
            aria-hidden="true"
            className={`mr-1 h-4 w-4 transition-transform duration-200 ${
              expanded ? "rotate-90" : "rotate-0"
            }`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex">
        <div className="mr-4 rounded-[16px] bg-white px-4 py-2 font-light text-black md:mr-24">
          <div className="mb-2 text-blue-500 text-sm">
            Server <span className="font-semibold">{item.server_label}</span>{" "}
            tools list
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {item.tools.map((tool) => (
              <div key={tool.name}>
                <div className="flex items-center gap-2 text-xs">
                  <div className="rounded-md bg-blue-100 p-1 text-blue-500">
                    <Code size={12} />
                  </div>
                  <div className="font-mono">{tool.name}</div>
                </div>
                {tool.description && (
                  <ToolDescription description={tool.description} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
