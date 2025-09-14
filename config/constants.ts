export const MODEL = "gpt-4.1";

// Developer prompt for the assistant
export const DEVELOPER_PROMPT = `
You are a helpful assistant for a dedicated chat app.
Prefer using the file search tool to ground answers in the user's uploaded or linked files when relevant.
If the user mentions details about themselves or their project that will help future responses, use the save_context function to store that information for later.
Where appropriate, format responses as a markdown list for clarity. Use line breaks between items to make lists more readable. Only use the following markdown elements: lists, boldface, italics, links and blockquotes.
`;

export function getDeveloperPrompt(): string {
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();
  const dayOfMonth = now.getDate();
  return `${DEVELOPER_PROMPT.trim()}\n\nToday is ${dayName}, ${monthName} ${dayOfMonth}, ${year}.`;
}

// Here is the context that you have available to you:
// ${context}

// Initial message that will be displayed in the chat
export const INITIAL_MESSAGE = `
Hi, how can I help you?
`;

export const defaultVectorStore = {
  id: "",
  name: "Example",
};
