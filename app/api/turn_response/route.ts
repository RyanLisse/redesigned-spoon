import { getDeveloperPrompt, MODEL } from "@/config/constants";
import logger from "@/lib/logger";
import { isReasoningModel } from "@/lib/models";
import { getTools } from "@/lib/tools/tools";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { messages, toolsState, modelId, reasoningEffort } = await request.json();

    const tools = await getTools(toolsState);
    logger.info({ tools }, "Tools prepared");
    logger.info({ messages }, "Turn request received");

    const openai = new OpenAI();

    const selectedModel = modelId || MODEL;
    const supportsReasoning = isReasoningModel(selectedModel);

    const events = await openai.responses.create({
      model: selectedModel,
      input: messages,
      instructions: getDeveloperPrompt(),
      tools,
      stream: true,
      parallel_tool_calls: false,
      ...(supportsReasoning && reasoningEffort
        ? { reasoning: { effort: reasoningEffort as "low" | "medium" | "high" } }
        : {}),
    });

    // Create a ReadableStream that emits SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            // Sending all events to the client
            const data = JSON.stringify({
              event: event.type,
              data: event,
            });
            controller.enqueue(`data: ${data}\n\n`);
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
    return new Response(stream, {
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
