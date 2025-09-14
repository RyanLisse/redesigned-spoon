"use client";

import React, { useEffect, useRef, useState } from "react";
import ToolCall from "./tool-call";
import Message from "./message";
import Annotations from "./annotations";
import McpToolsList from "./mcp-tools-list";
import McpApproval from "./mcp-approval";
import { Item, McpApprovalRequestItem } from "@/lib/assistant";
import LoadingMessage from "./loading-message";
import useConversationStore from "@/stores/useConversationStore";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { PaperclipIcon } from "lucide-react";
import useUiStore from "@/stores/useUiStore";

interface ChatProps {
  items: Item[];
  onSendMessage: (message: string) => void;
  onApprovalResponse: (approve: boolean, id: string) => void;
}

const Chat: React.FC<ChatProps> = ({ items, onSendMessage, onApprovalResponse }) => {
  const itemsEndRef = useRef<HTMLDivElement>(null);
  const [inputMessageText, setInputMessageText] = useState<string>("");
  const { isAssistantLoading } = useConversationStore();
  const { modelId, setModelId, reasoningEffort, setReasoningEffort } = useUiStore();

  const scrollToBottom = () => {
    itemsEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  const isEmpty = items.length === 0 && !isAssistantLoading;

  return (
    <div className="flex justify-center items-center size-full">
      <div className="flex grow flex-col h-full max-w-[900px] gap-2">
        <Conversation className="px-6">
          <ConversationContent className="flex flex-col gap-5 pt-4">
            {isEmpty ? (
              <div className="mt-24 flex flex-col items-center gap-6">
                <h1 className="text-3xl sm:text-5xl font-semibold text-blue-500 text-center">
                  How can we help you today?
                </h1>
              </div>
            ) : null}

            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.type === "tool_call" ? (
                  <ToolCall toolCall={item} />
                ) : item.type === "message" ? (
                  <div className="flex flex-col gap-1">
                    <Message message={item} />
                    {item.content &&
                      item.content[0].annotations &&
                      item.content[0].annotations.length > 0 && (
                        <Annotations annotations={item.content[0].annotations} />
                      )}
                  </div>
                ) : item.type === "mcp_list_tools" ? (
                  <McpToolsList item={item} />
                ) : item.type === "mcp_approval_request" ? (
                  <McpApproval
                    item={item as McpApprovalRequestItem}
                    onRespond={onApprovalResponse}
                  />
                ) : null}
              </React.Fragment>
            ))}
            {isAssistantLoading && <LoadingMessage />}
            <div ref={itemsEndRef} />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="flex-1 p-4 px-6">
          <PromptInput
            className="rounded-2xl border border-white/10 bg-[#1a1a1a] text-foreground shadow-sm"
            onSubmit={(message) => {
              const text = (message.text || "").trim();
              if (!text) return;
              onSendMessage(text);
              setInputMessageText("");
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask anything..."
                value={inputMessageText}
                onChange={(e) => setInputMessageText(e.currentTarget.value)}
                className="text-base"
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

                  <PromptInputModelSelect value={modelId} onValueChange={(v) => setModelId(v)}>
                    <PromptInputModelSelectTrigger>
                      <PromptInputModelSelectValue />
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent>
                      <PromptInputModelSelectItem value="gpt-4.1">
                        GPT-4.1
                      </PromptInputModelSelectItem>
                      <PromptInputModelSelectItem value="gpt-4o-mini">
                        GPT-4o mini
                      </PromptInputModelSelectItem>
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                  <PromptInputModelSelect value={reasoningEffort} onValueChange={(v) => setReasoningEffort(v as any)}>
                    <PromptInputModelSelectTrigger>
                      <PromptInputModelSelectValue />
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent>
                      <PromptInputModelSelectItem value="low">Low</PromptInputModelSelectItem>
                      <PromptInputModelSelectItem value="medium">Medium</PromptInputModelSelectItem>
                      <PromptInputModelSelectItem value="high">High</PromptInputModelSelectItem>
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                </PromptInputTools>
                <PromptInputSubmit aria-label="Send" />
              </PromptInputToolbar>
            </PromptInputBody>
          </PromptInput>

          <div className="mt-3">
            <Suggestions className="mx-auto max-w-[720px]">
              {["Operation", "Troubleshooting", "Maintenance", "Safety", "Specifications", "Setup"].map(
                (s) => (
                  <Suggestion
                    key={s}
                    suggestion={s}
                    onClick={(val) => setInputMessageText(val + ": ")}
                  />
                )
              )}
            </Suggestions>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
