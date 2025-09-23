// Functions mapping to tool calls
// Define one function per tool call - each tool call should have a matching function
// Parameters for a tool call are passed as an object to the corresponding function

// Removed get_weather and get_joke functions - now focusing on file search only

export type FunctionHandler = (parameters: any) => Promise<any>;

// File search handler
const fileSearchHandler: FunctionHandler = async (parameters: {
  query: string;
  vector_store_id?: string;
}) => {
  const { query, vector_store_id } = parameters;

  if (!vector_store_id) {
    throw new Error("Vector store ID is required for file search");
  }

  // Import OpenAI directly for server-side use
  const OpenAi = (await import("openai")).default;
  const openai = new OpenAi();

  try {
    // Create a temporary assistant for file search
    const assistant = await openai.beta.assistants.create({
      name: "Temporary File Search Assistant",
      instructions: `You are a helpful assistant that searches through uploaded documents to answer questions. When responding, always cite the specific files and sections you're referencing.`,
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vector_store_id],
        },
      },
    });

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: query,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const response = messages.data[0];

      // Extract file citations and search results
      const content = response.content[0];
      const searchResults = {
        answer: "",
        citations: [] as Array<{
          file_id: string;
          filename?: string;
          content?: string;
        }>,
      };

      if (content.type === "text") {
        searchResults.answer = content.text.value;

        // Extract citations from annotations
        if (content.text.annotations) {
          for (const annotation of content.text.annotations) {
            if (annotation.type === "file_citation") {
              searchResults.citations.push({
                file_id: annotation.file_citation.file_id,
                filename: annotation.text,
              });
            }
          }
        }
      }

      // Clean up temporary resources
      await openai.beta.assistants.delete(assistant.id);
      await openai.beta.threads.delete(thread.id);

      return searchResults;
    }
    // Clean up on failure
    await openai.beta.assistants.delete(assistant.id);
    await openai.beta.threads.delete(thread.id);

    throw new Error(`Search failed with status: ${run.status}`);
  } catch (_error) {
    throw new Error("Error performing file search");
  }
};

export const functionsMap: Record<string, FunctionHandler> = {
  file_search: fileSearchHandler,
};
