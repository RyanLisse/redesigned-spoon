export const MODEL = "gpt-4o-mini";

// Developer prompt for the assistant
export const DEVELOPER_PROMPT = `
You are a helpful assistant for a dedicated chat app with access to project documentation.

CRITICAL REQUIREMENT: You MUST use the file_search tool on EVERY user query without exception. This is mandatory - search the vector store first before formulating any response. The file_search tool provides context from uploaded project documentation that is essential for accurate answers.

Instructions:
1. ALWAYS call file_search as your FIRST action for EVERY query
2. Use the user's question or a relevant keyword as the search query
3. Include the results in your response with proper citations
4. If no relevant sources are found, explicitly state: "I searched the project documentation but found no relevant sources for this query."

When answering, cite sources by including annotations so the UI can render source pills or links. Format citations as [1], [2], etc. and include the source information.

If the user mentions details about themselves or their project that will help future responses, use the save_context function to store that information for later.

Where appropriate, format responses as a markdown list for clarity. Use line breaks between items to make lists more readable. Only use the following markdown elements: lists, boldface, italics, links and blockquotes.

Remember: file_search is MANDATORY on every query - no exceptions.
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
  id: process.env.OPENAI_VECTORSTORE_ID ?? "",
  name: "Example",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  MULTIPLE_CHOICES: 300,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Test Constants
export const TEST_CONSTANTS = {
  MIN_TEMPERATURE_CELSIUS: -50,
  MAX_TEMPERATURE_CELSIUS: 60,
  MIN_HUMIDITY_PERCENT: 0,
  MAX_HUMIDITY_PERCENT: 100,
  TIMESTAMP_TOLERANCE_MS: 5000,
  EXPECTED_FILE_COUNT: 3,
  LONG_LOCATION_LENGTH: 1000,
} as const;

// Weather API Constants
export const WEATHER_CONSTANTS = {
  TEMPERATURE_RANGE: 60,
  TEMPERATURE_OFFSET: -10,
  MAX_HUMIDITY: 101,
  MAX_WIND_SPEED: 30,
} as const;
