"use client";
import { CircleX } from "lucide-react";
import React, { useState } from "react";
import FileUpload from "@/components/file-upload";
import useToolsStore from "@/stores/useToolsStore";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function FileSearchSetup() {
  const { vectorStore, setVectorStore } = useToolsStore();
  const [newStoreId, setNewStoreId] = useState<string>("");

  const unlinkStore = async () => {
    setVectorStore({
      id: "",
      name: "",
    });
  };

  const handleAddStore = async (storeId: string) => {
    if (storeId.trim()) {
      const newStore = await fetch(
        `/api/vector_stores/retrieve_store?vector_store_id=${storeId}`
      ).then((res) => res.json());
      if (newStore.id) {
        console.log("Retrieved store:", newStore);
        setVectorStore(newStore);
      } else {
        alert("Vector store not found");
      }
    }
  };

  return (
    <div>
      <div className="text-sm text-zinc-500">
        Upload a file to create a new vector store, or use an existing one.
      </div>
      <div className="mt-2 flex h-10 items-center gap-2">
        <div className="flex w-full items-center gap-2">
          <div className="w-24 text-nowrap font-medium text-sm">
            Vector store
          </div>
          {vectorStore?.id ? (
            <div className="flex min-w-0 flex-1 items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex-1 truncate text-ellipsis font-mono text-xs text-zinc-400">
                  {vectorStore.id}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleX
                        className="mt-0.5 mb-0.5 shrink-0 cursor-pointer text-zinc-400 transition-all hover:text-zinc-700"
                        onClick={() => unlinkStore()}
                        size={16}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="mr-2">
                      <p>Unlink vector store</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                className="rounded border border-zinc-300 bg-white text-sm"
                onChange={(e) => setNewStoreId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddStore(newStoreId);
                  }
                }}
                placeholder="ID (vs_XXXX...)"
                type="text"
                value={newStoreId}
              />
              <div
                className="cursor-pointer px-1 text-sm text-zinc-400 transition-colors hover:text-zinc-600"
                onClick={() => handleAddStore(newStoreId)}
              >
                Add
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex">
        <FileUpload
          onAddStore={(id) => handleAddStore(id)}
          onUnlinkStore={() => unlinkStore()}
          vectorStoreId={vectorStore?.id ?? ""}
          vectorStoreName={vectorStore?.name ?? ""}
        />
      </div>
    </div>
  );
}
