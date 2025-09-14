"use client";

import {
  BugIcon,
  CogIcon,
  FileTextIcon,
  PaperclipIcon,
  PlugIcon,
  ShieldAlertIcon,
  WrenchIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import type {
  Item,
  McpApprovalRequestItem,
  McpListToolsItem,
  MessageItem,
  ToolCallItem,
} from "@/lib/assistant";
import { isReasoningModel, MODELS } from "@/lib/models";
import useConversationStore from "@/stores/useConversationStore";
import type { ReasoningEffort } from "@/stores/useUiStore";
import useUiStore from "@/stores/useUiStore";
import Annotations from "./annotations";
import LoadingMessage from "./loading-message";
import McpApproval from "./mcp-approval";
import McpToolsList from "./mcp-tools-list";
import Message from "./message";
import ToolCall from "./tool-call";

type ChatProps = {
  items: Item[];
  onSendMessage: (message: string) => void;
  onApprovalResponse: (approve: boolean, id: string) => void;
};

const Chat: React.FC<ChatProps> = ({
  items,
  onSendMessage,
  onApprovalResponse,
}) => {
  const itemsEndRef = useRef<HTMLDivElement>(null);
  const [inputMessageText, setInputMessageText] = useState<string>("");
  const { isAssistantLoading } = useConversationStore();
  const { modelId, setModelId, reasoningEffort, setReasoningEffort } =
    useUiStore();

  // Observe DOM changes and scroll to bottom without depending on items array
  useEffect(() => {
    const scroll = () => {
      itemsEndRef.current?.scrollIntoView({ behavior: "instant" });
    };
    scroll();
    const parent = itemsEndRef.current?.parentElement;
    if (!parent) {
      return;
    }
    const observer = new MutationObserver(() => scroll());
    observer.observe(parent, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const reasoningFor = (id: string) => isReasoningModel(id);

  const getItemKey = (item: Item, index: number): string => {
    if ("id" in item && item.id) {
      return item.id;
    }
    if (item.type === "message") {
      const msg = item as MessageItem;
      const base = `${msg.role}-${msg.content?.[0]?.text ?? ""}`;
      return `message-${base}-i${index}`;
    }
    if (item.type === "mcp_list_tools") {
      const tools = (item as McpListToolsItem).tools?.length ?? 0;
      return `mcp_list_tools-${tools}-i${index}`;
    }
    if (item.type === "tool_call") {
      const tc = item as ToolCallItem;
      return `tool_call-${tc.name ?? ""}-${tc.status}-i${index}`;
    }
    return `${item.type}-i${index}`;
  };

  const renderConversationItem = (item: Item, index: number): ReactNode => {
    switch (item.type) {
      case "tool_call": {
        return <ToolCall key={getItemKey(item, index)} toolCall={item} />;
      }
      case "message": {
        return (
          <div className="flex flex-col gap-1" key={getItemKey(item, index)}>
            <Message message={item} />
            {item.content?.[0]?.annotations?.length ? (
              <Annotations annotations={item.content[0].annotations} />
            ) : null}
          </div>
        );
      }
      case "mcp_list_tools": {
        return <McpToolsList item={item} key={getItemKey(item, index)} />;
      }
      case "mcp_approval_request": {
        return (
          <McpApproval
            item={item as McpApprovalRequestItem}
            key={getItemKey(item, index)}
            onRespond={onApprovalResponse}
          />
        );
      }
      default: {
        return null;
      }
    }
  };

  return (
    <div className="flex h-full items-center justify-center bg-[#1a1d21]">
      <div className="flex h-full max-w-[900px] grow flex-col gap-2">
        <Conversation className="px-6">
          <ConversationContent className="flex flex-col gap-5 pt-10">
            {items.length === 0 && !isAssistantLoading ? (
              <div className="mt-32 flex flex-col items-center gap-6">
                <h1 className="text-center font-normal text-4xl text-[#4a9eff] sm:text-5xl">
                  How can we help you today?
                </h1>
              </div>
            ) : null}

            {items.map((item, index) => renderConversationItem(item, index))}
            {isAssistantLoading && <LoadingMessage />}
            <div ref={itemsEndRef} />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="flex-1 p-4 px-6">
          <PromptInput
            className="mx-auto w-full max-w-[720px] rounded-xl border border-gray-700/50 bg-[#2a2d31] text-white shadow-lg"
            onSubmit={(message) => {
              const text = (message.text || "").trim();
              if (!text) {
                return;
              }
              onSendMessage(text);
              setInputMessageText("");
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                className="text-base text-gray-200 placeholder-gray-500"
                onChange={(e) => setInputMessageText(e.currentTarget.value)}
                placeholder="Ask anything..."
                value={inputMessageText}
              />
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger aria-label="Add attachment">
                      <PaperclipIcon className="size-4" />
                    </PromptInputActionMenuTrigger>
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>

                  <PromptInputModelSelect
                    onValueChange={(v) => setModelId(v)}
                    value={modelId}
                  >
                    <PromptInputModelSelectTrigger>
                      <PromptInputModelSelectValue />
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent>
                      {MODELS.map((m) => (
                        <PromptInputModelSelectItem key={m.id} value={m.id}>
                          {m.label ?? m.id}
                        </PromptInputModelSelectItem>
                      ))}
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                  {reasoningFor(modelId) && (
                    <PromptInputModelSelect
                      onValueChange={(v: ReasoningEffort) =>
                        setReasoningEffort(v)
                      }
                      value={reasoningEffort}
                    >
                      <PromptInputModelSelectTrigger>
                        <PromptInputModelSelectValue />
                      </PromptInputModelSelectTrigger>
                      <PromptInputModelSelectContent>
                        <PromptInputModelSelectItem value="low">
                          Low
                        </PromptInputModelSelectItem>
                        <PromptInputModelSelectItem value="medium">
                          Medium
                        </PromptInputModelSelectItem>
                        <PromptInputModelSelectItem value="high">
                          High
                        </PromptInputModelSelectItem>
                      </PromptInputModelSelectContent>
                    </PromptInputModelSelect>
                  )}
                </PromptInputTools>
                <PromptInputSubmit aria-label="Send" />
              </PromptInputToolbar>
            </PromptInputBody>
          </PromptInput>

          <div className="mt-4">
            <div className="mx-auto max-w-[720px]">
              <Suggestions>
                <Suggestion
                  className="border border-gray-700/50 bg-[#2a2d31] text-gray-300 hover:border-gray-600 hover:bg-[#323539]"
                  onClick={(s) => setInputMessageText(`${s} `)}
                  suggestion="What are the RoboRail safety interlocks?"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlertIcon className="size-4" />
                    <span>Safety interlocks</span>
                  </span>
                </Suggestion>
                <Suggestion
                  className="border border-gray-700/50 bg-[#2a2d31] text-gray-300 hover:border-gray-600 hover:bg-[#323539]"
                  onClick={(s) => setInputMessageText(`${s} `)}
                  suggestion="What is the RoboRail maintenance schedule?"
                >
                  <span className="flex items-center gap-2">
                    <WrenchIcon className="size-4" />
                    <span>Maintenance schedule</span>
                  </span>
                </Suggestion>
                <Suggestion
                  className="border border-gray-700/50 bg-[#2a2d31] text-gray-300 hover:border-gray-600 hover:bg-[#323539]"
                  onClick={(s) => setInputMessageText(`${s} `)}
                  suggestion="What are the RoboRail electrical specifications?"
                >
                  <span className="flex items-center gap-2">
                    <FileTextIcon className="size-4" />
                    <span>Electrical specs</span>
                  </span>
                </Suggestion>
                <Suggestion
                  className="border border-gray-700/50 bg-[#2a2d31] text-gray-300 hover:border-gray-600 hover:bg-[#323539]"
                  onClick={(s) => setInputMessageText(`${s} `)}
                  suggestion="How do I set up the HGG RoboRail for a new profile?"
                >
                  <span className="flex items-center gap-2">
                    <PlugIcon className="size-4" />
                    <span>Setup new profile</span>
                  </span>
                </Suggestion>
                <Suggestion
                  className="border border-gray-700/50 bg-[#2a2d31] text-gray-300 hover:border-gray-600 hover:bg-[#323539]"
                  onClick={(s) => setInputMessageText(`${s} `)}
                  suggestion="How to troubleshoot RoboRail calibration issues?"
                >
                  <span className="flex items-center gap-2">
                    <BugIcon className="size-4" />
                    <span>Calibration troubleshooting</span>
                  </span>
                </Suggestion>
                <Suggestion
                  className="border border-gray-700/50 bg-[#2a2d31] text-gray-300 hover:border-gray-600 hover:bg-[#323539]"
                  onClick={(s) => setInputMessageText(`${s} `)}
                  suggestion="What is the RoboRail operational range and capacity?"
                >
                  <span className="flex items-center gap-2">
                    <CogIcon className="size-4" />
                    <span>Operation range & capacity</span>
                  </span>
                </Suggestion>
              </Suggestions>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
