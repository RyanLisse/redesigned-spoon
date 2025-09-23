import OpenAi from "openai";
import { getDeveloperPrompt, MODEL } from "@/config/constants";
import { functionsMap } from "@/config/functions";
import logger from "@/lib/logger";
import { isReasoningModel } from "@/lib/models";
import { getTools } from "@/lib/tools/tools";

// Type definitions for chunk handling
type ChunkDelta = {
  content?: string;
  // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
  tool_calls?: unknown[];
  reasoning?: unknown;
};

type MessageContent = {
  type: string;
  text: string;
};

type Message = {
  role: string;
  content: string | MessageContent[];
};

type ChunkChoice = {
  delta?: ChunkDelta;
  message?: {
    // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
    tool_calls?: Array<{
      id?: string;
      type: string;
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      file_search?: {
        results?: Array<{
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          file_id: string;
          filename?: string;
          content?: string;
        }>;
      };
    }>;
    annotations?: unknown[];
  };
  // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
  finish_reason?: string;
};

type StreamChunk = {
  choices?: ChunkChoice[];
};

type ToolCall = {
  id: string;
  type: string;
  function?: {
    name: string;
    arguments: string;
  };
};

// Helper function to execute tool calls and continue conversation
async function executeToolCallsAndContinue(
  toolCalls: ToolCall[],
  messages: any[],
  openai: OpenAi,
  chatParams: any,
  controller: ReadableStreamDefaultController<string>
) {
  const toolMessages: any[] = [];

  // Execute each tool call
  for (const toolCall of toolCalls) {
    if (toolCall.function?.name && functionsMap[toolCall.function.name]) {
      try {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        const result = await functionsMap[toolCall.function.name](args);

        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });

        // Emit tool result event
        const toolResultData = JSON.stringify({
          event: "tool_result",
          data: {
            tool_call_id: toolCall.id,
            result,
            annotations: result.citations || [],
          },
        });
        controller.enqueue(`data: ${toolResultData}\n\n`);
      } catch (error) {
        logger.error({ error, toolCall }, "Error executing tool call");
        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: "Tool execution failed" }),
        });
      }
    }
  }

  // Add assistant message with tool calls to maintain conversation flow
  const assistantMessage = {
    role: "assistant",
    content: "",
    tool_calls: toolCalls.map((tc) => ({
      id: tc.id,
      type: tc.type,
      function: {
        name: tc.function?.name,
        arguments: tc.function?.arguments,
      },
    })),
  };

  // Continue conversation with tool results
  // Ensure proper message order: original messages + assistant with tool_calls + tool responses
  const continuationParams = {
    ...chatParams,
    messages: [...messages, assistantMessage, ...toolMessages],
  };

  const continuationStream = (await openai.chat.completions.create(
    continuationParams
  )) as any;

  // Stream the continuation response
  for await (const chunk of continuationStream) {
    const typedChunk = chunk as StreamChunk;
    const choice = typedChunk.choices?.[0];

    if (!choice) {
      continue;
    }

    // Handle delta chunks (streaming content, reasoning)
    if (choice.delta) {
      const itemId = "msg_2"; // Different ID for continuation
      handleContentChunk(controller, choice.delta, itemId);
      handleReasoningChunk(controller, choice.delta, itemId);
    }

    // Handle message completion
    handleMessageComplete(controller, choice);

    // Handle finish reason
    handleFinishReason(controller, choice);
  }
}

// Helper functions to handle different chunk types
function handleContentChunk(
  controller: ReadableStreamDefaultController<string>,
  delta: ChunkDelta,
  itemId = "msg_1"
): void {
  if (delta.content) {
    const data = JSON.stringify({
      event: "response.output_text.delta",
      data: {
        delta: delta.content,
        // biome-ignore lint/style/useNamingConvention: OpenAI API event format uses snake_case
        item_id: itemId,
      },
    });
    controller.enqueue(`data: ${data}\n\n`);
  }
}

function handleToolCallsChunk(
  controller: ReadableStreamDefaultController<string>,
  delta: ChunkDelta
): void {
  if (delta.tool_calls) {
    // Handle file search tool calls with appropriate events
    for (const toolCall of delta.tool_calls as ToolCall[]) {
      if (toolCall.function?.name === "file_search") {
        // Handle file_search as a function call, not a native tool
        const data = JSON.stringify({
          event: "response.output_item.added",
          data: {
            item: {
              type: "function_call",
              id: toolCall.id || "func_1",
              name: toolCall.function?.name,
              arguments: toolCall.function?.arguments || "",
            },
          },
        });
        controller.enqueue(`data: ${data}\n\n`);
      } else if (toolCall.type === "file_search") {
        // Native file search (not used in our setup)
        const fileSearchData = JSON.stringify({
          event: "response.output_item.added",
          data: {
            item: {
              type: "file_search_call",
              id: toolCall.id || "fs_1",
              status: "in_progress",
            },
          },
        });
        controller.enqueue(`data: ${fileSearchData}\n\n`);
      } else {
        // Handle other tool calls
        const data = JSON.stringify({
          event: "response.output_item.added",
          data: {
            item: {
              type: "function_call",
              id: toolCall.id || "func_1",
              name: toolCall.function?.name,
              arguments: toolCall.function?.arguments || "",
            },
          },
        });
        controller.enqueue(`data: ${data}\n\n`);
      }
    }
  }
}

function handleReasoningChunk(
  controller: ReadableStreamDefaultController<string>,
  delta: ChunkDelta,
  itemId = "msg_1"
): void {
  if (delta.reasoning) {
    const data = JSON.stringify({
      event: "response.reasoning.delta",
      data: {
        delta: delta.reasoning,
        // biome-ignore lint/style/useNamingConvention: OpenAI API event format uses snake_case
        item_id: itemId,
      },
    });
    controller.enqueue(`data: ${data}\n\n`);
  }
}

function extractFileSearchAnnotations(
  message: NonNullable<ChunkChoice["message"]>
): unknown[] {
  const annotations: unknown[] = [];

  if (message.tool_calls) {
    for (const toolCall of message.tool_calls) {
      if (toolCall.type === "file_search" && toolCall.file_search?.results) {
        const fileSearchAnnotations = toolCall.file_search.results.map(
          (result, index) => ({
            type: "file_citation",
            fileId: result.file_id,
            filename: result.filename || `File ${index + 1}`,
            index,
            title: result.filename || `File ${index + 1}`,
            content: result.content || "",
          })
        );
        annotations.push(...fileSearchAnnotations);
      }
    }
  }

  if (message.annotations) {
    annotations.push(...message.annotations);
  }

  return annotations;
}

function handleMessageComplete(
  controller: ReadableStreamDefaultController<string>,
  choice: ChunkChoice
): void {
  if (choice.message) {
    const annotations = extractFileSearchAnnotations(choice.message);

    // If we have file search results, emit file search completion events
    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type === "file_search" && toolCall.file_search?.results) {
          const fileSearchCompletedData = JSON.stringify({
            event: "response.file_search_call.completed",
            data: {
              // biome-ignore lint/style/useNamingConvention: OpenAI API event format uses snake_case
              item_id: toolCall.id || "fs_1",
              output: JSON.stringify(toolCall.file_search.results),
            },
          });
          controller.enqueue(`data: ${fileSearchCompletedData}\n\n`);

          // Emit individual annotation events for each file citation
          for (const result of toolCall.file_search.results) {
            const annotationData = JSON.stringify({
              event: "response.output_text.annotation.added",
              data: {
                // biome-ignore lint/style/useNamingConvention: OpenAI API event format uses snake_case
                item_id: "msg_1",
                annotation: {
                  type: "file_citation",
                  fileId: result.file_id,
                  filename:
                    result.filename ||
                    `File ${toolCall.file_search.results.indexOf(result) + 1}`,
                  index: toolCall.file_search.results.indexOf(result),
                  title:
                    result.filename ||
                    `File ${toolCall.file_search.results.indexOf(result) + 1}`,
                  content: result.content || "",
                },
              },
            });
            controller.enqueue(`data: ${annotationData}\n\n`);
          }
        }
      }
    }

    const data = JSON.stringify({
      event: "message_complete",
      data: {
        message: choice.message,
        annotations,
      },
    });
    controller.enqueue(`data: ${data}\n\n`);
  }
}

function handleFinishReason(
  controller: ReadableStreamDefaultController<string>,
  choice: ChunkChoice
): void {
  if (choice.finish_reason) {
    const data = JSON.stringify({
      event: "finish",
      data: {
        // biome-ignore lint/style/useNamingConvention: OpenAI API event format uses snake_case
        finish_reason: choice.finish_reason,
      },
    });
    controller.enqueue(`data: ${data}\n\n`);
  }
}

export async function POST(request: Request) {
  try {
    const { messages, toolsState, modelId, reasoningEffort } =
      await request.json();

    const tools = getTools(toolsState) || [];
    logger.info(
      { tools, toolsCount: tools?.length || 0, toolsState },
      "Tools prepared"
    );
    logger.info(
      { messages, messagesCount: messages?.length || 0 },
      "Turn request received"
    );

    const openai = new OpenAi();

    const selectedModel = modelId || MODEL;
    const _supportsReasoning = isReasoningModel(selectedModel);

    // Normalize message content format for OpenAI API
    const normalizedMessages = messages.map((msg: Message) => {
      // Convert content arrays with type "input_text" to simple string content
      if (
        msg.content &&
        Array.isArray(msg.content) &&
        msg.content.length === 1 &&
        msg.content[0] &&
        msg.content[0].type === "input_text"
      ) {
        return { ...msg, content: msg.content[0].text };
      }
      return msg;
    });

    // Format messages for Chat Completions API
    const formattedMessages = [
      {
        role: "system" as const,
        content: getDeveloperPrompt(),
      },
      ...normalizedMessages,
    ];

    const chatParams = {
      model: selectedModel,
      messages: formattedMessages,
      tools: tools.length > 0 ? tools : undefined,
      stream: true as const,
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      ...(tools.length > 0 ? { parallel_tool_calls: false } : {}),
      // Note: reasoning parameter is not supported in current OpenAI SDK version
      // Commented out to prevent 400 errors:
      // ...(supportsReasoning && reasoningEffort
      //   ? {
      //       reasoning: { effort: reasoningEffort as "low" | "medium" | "high" },
      //     }
      //   : {}),
    };

    const stream = await openai.chat.completions.create(
      chatParams as OpenAi.Chat.Completions.ChatCompletionCreateParamsStreaming
    );

    // Create a ReadableStream that emits SSE data
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const currentToolCalls: ToolCall[] = [];
          let accumulatingToolCall: Partial<ToolCall> = {};

          for await (const chunk of stream as any) {
            const typedChunk = chunk as StreamChunk;
            const choice = typedChunk.choices?.[0];

            if (!choice) {
              continue;
            }

            // Handle delta chunks (streaming content, tool calls, reasoning)
            if (choice.delta) {
              const itemId = "msg_1"; // Generate or use appropriate item ID
              handleContentChunk(controller, choice.delta, itemId);

              // Accumulate tool calls
              if (choice.delta.tool_calls) {
                for (const toolCallDelta of choice.delta.tool_calls as any[]) {
                  if (toolCallDelta.id) {
                    // New tool call
                    if (
                      accumulatingToolCall.id &&
                      accumulatingToolCall.function?.name
                    ) {
                      currentToolCalls.push(accumulatingToolCall as ToolCall);
                    }
                    accumulatingToolCall = {
                      id: toolCallDelta.id,
                      type: toolCallDelta.type || "function",
                      function: {
                        name: toolCallDelta.function?.name || "",
                        arguments: toolCallDelta.function?.arguments || "",
                      },
                    };
                  } else if (toolCallDelta.function?.arguments) {
                    // Continue accumulating arguments
                    if (accumulatingToolCall.function) {
                      accumulatingToolCall.function.arguments +=
                        toolCallDelta.function.arguments;
                    }
                  }
                }
              }

              handleToolCallsChunk(controller, choice.delta);
              handleReasoningChunk(controller, choice.delta, itemId);
            }

            // Handle finish reason - execute tools if needed
            if (choice.finish_reason === "tool_calls") {
              // Add final accumulated tool call
              if (
                accumulatingToolCall.id &&
                accumulatingToolCall.function?.name
              ) {
                currentToolCalls.push(accumulatingToolCall as ToolCall);
              }

              logger.info(
                { toolCalls: currentToolCalls },
                "Executing tool calls"
              );

              // Execute tool calls and continue conversation
              await executeToolCallsAndContinue(
                currentToolCalls,
                formattedMessages,
                openai,
                chatParams,
                controller
              );
            } else {
              // Handle message completion with citations/annotations
              handleMessageComplete(controller, choice);

              // Handle other finish reasons
              handleFinishReason(controller, choice);
            }
          }
          // End of stream
          controller.close();
        } catch (error) {
          logger.error({ err: error }, "Error in streaming loop");
          controller.error(error as Error);
        }
      },
    });

    // Return the ReadableStream as SSE
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error in POST handler");
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
