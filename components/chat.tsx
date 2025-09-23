"use client";

import {
  CogIcon,
  FileTextIcon,
  NotepadText,
  Paintbrush,
  PaperclipIcon,
  Sparkle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ReactNode } from "react";
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
import { SUGGESTIONS } from "@/lib/config";
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

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const showOnboarding = items.length === 0 && !isAssistantLoading;

  // Reset active category when input is cleared
  if (!inputMessageText && activeCategory !== null) {
    setActiveCategory(null);
  }

  // Derive active category from input text
  const derivedActiveCategory = useMemo(() => {
    if (inputMessageText) {
      const matched = SUGGESTIONS.find(
        (group) => group.prompt === inputMessageText
      );
      if (matched) return matched.label;
    }
    return activeCategory;
  }, [inputMessageText, activeCategory]);

  const activeCategoryData = SUGGESTIONS.find(
    (group) => group.label === derivedActiveCategory
  );

  const showCategorySuggestions =
    activeCategoryData && activeCategoryData.items.length > 0;

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setActiveCategory(null);
      onSendMessage(suggestion);
      setInputMessageText("");
    },
    [onSendMessage]
  );

  const handleCategoryClick = useCallback(
    (category: { label: string; prompt: string }) => {
      setActiveCategory(category.label);
      setInputMessageText(category.prompt);
    },
    []
  );

  const suggestionsGrid = useMemo(
    () => (
      <motion.div
        animate="animate"
        className="flex w-full max-w-full flex-nowrap justify-start gap-2 overflow-x-auto px-2 md:mx-auto md:max-w-2xl md:flex-wrap md:justify-center md:pl-0"
        initial="initial"
        key="suggestions-grid"
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        variants={{
          initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        }}
      >
        {SUGGESTIONS.map((suggestion, index) => (
          <motion.button
            key={suggestion.label}
            className="flex items-center gap-2 rounded-full border border-gray-700/50 bg-[#2a2d31] px-4 py-2 text-sm text-gray-300 transition-colors duration-200 hover:border-gray-600 hover:bg-[#323539]"
            animate="animate"
            initial="initial"
            onClick={() => handleCategoryClick(suggestion)}
            transition={{
              duration: 0.3,
              delay: index * 0.02,
              ease: "easeOut",
            }}
            variants={{
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
            }}
          >
            <suggestion.icon className="size-4" />
            {suggestion.label}
          </motion.button>
        ))}
      </motion.div>
    ),
    [handleCategoryClick]
  );

  const suggestionsList = useMemo(
    () => (
      <motion.div
        animate="animate"
        className="flex w-full flex-col space-y-1 px-2"
        initial="initial"
        key={activeCategoryData?.label}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        variants={{
          initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          exit: {
            opacity: 0,
            y: -10,
            filter: 'blur(4px)',
          },
        }}
      >
        {activeCategoryData?.items.map((suggestion: string, index: number) => (
          <motion.button
            key={`${activeCategoryData?.label}-${suggestion}-${index}`}
            className="block h-full text-left text-sm text-gray-300 transition-colors duration-200 hover:text-white"
            animate="animate"
            initial="initial"
            onClick={() => handleSuggestionClick(suggestion)}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut",
            }}
            variants={{
              initial: { opacity: 0, y: -10 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    ),
    [
      handleSuggestionClick,
      activeCategoryData?.highlight,
      activeCategoryData?.items,
      activeCategoryData?.label,
    ]
  );

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
            <AnimatePresence mode="wait">
              {showOnboarding ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-24 flex flex-col items-center gap-6"
                  exit={{ opacity: 0, y: -20 }}
                  initial={{ opacity: 0, y: 20 }}
                  key="onboarding"
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-center font-semibold text-4xl text-[#4a9eff] sm:text-5xl">
                    How can we help you today?
                  </h1>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key="conversation"
                  transition={{ duration: 0.3 }}
                >
                  {items.map((item, index) =>
                    renderConversationItem(item, index)
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {isAssistantLoading && <LoadingMessage />}
            <div ref={itemsEndRef} />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <motion.div
          className="relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl px-6"
          layout="position"
          layoutId="chat-input-container"
          transition={{
            layout: {
              duration: items.length === 1 ? 0.3 : 0,
            },
          }}
        >
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
                  {isReasoningModel(modelId) && (
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

          <AnimatePresence mode="wait">
            {showCategorySuggestions ? suggestionsList : suggestionsGrid}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;
