"use client";
import React from "react";
import useToolsStore from "@/stores/useToolsStore";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

export default function McpConfig() {
  const { mcpConfig, setMcpConfig } = useToolsStore();

  const handleClear = () => {
    setMcpConfig({
      server_label: "",
      server_url: "",
      allowed_tools: "",
      skip_approval: false,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-600">Server details</div>
        <div
          className="cursor-pointer px-1 text-sm text-zinc-400 transition-colors hover:text-zinc-600"
          onClick={handleClear}
        >
          Clear
        </div>
      </div>
      <div className="mt-3 space-y-3 text-zinc-400">
        <div className="flex items-center gap-2">
          <label className="w-24 text-sm" htmlFor="server_label">
            Label
          </label>
          <Input
            className="flex-1 border bg-white text-sm text-zinc-900 placeholder:text-zinc-400"
            id="server_label"
            onChange={(e) =>
              setMcpConfig({ ...mcpConfig, server_label: e.target.value })
            }
            placeholder="deepwiki"
            type="text"
            value={mcpConfig.server_label}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-sm" htmlFor="server_url">
            URL
          </label>
          <Input
            className="flex-1 border bg-white text-sm text-zinc-900 placeholder:text-zinc-400"
            id="server_url"
            onChange={(e) =>
              setMcpConfig({ ...mcpConfig, server_url: e.target.value })
            }
            placeholder="https://example.com/mcp"
            type="text"
            value={mcpConfig.server_url}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-sm" htmlFor="allowed_tools">
            Allowed
          </label>
          <Input
            className="flex-1 border bg-white text-sm text-zinc-900 placeholder:text-zinc-400"
            id="allowed_tools"
            onChange={(e) =>
              setMcpConfig({ ...mcpConfig, allowed_tools: e.target.value })
            }
            placeholder="tool1,tool2"
            type="text"
            value={mcpConfig.allowed_tools}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-sm" htmlFor="skip_approval">
            Skip approval
          </label>
          <Switch
            checked={mcpConfig.skip_approval}
            id="skip_approval"
            onCheckedChange={(checked) =>
              setMcpConfig({ ...mcpConfig, skip_approval: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}
