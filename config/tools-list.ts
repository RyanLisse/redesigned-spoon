// List of tools available to the assistant
// No need to include the top-level wrapper object as it is added in lib/tools/tools.ts
// More information on function calling: https://platform.openai.com/docs/guides/function-calling

export type ToolParameter = {
  type: string;
  description?: string;
  enum?: string[];
  properties?: { [key: string]: unknown };
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: { [key: string]: ToolParameter };
};

export const toolsList: ToolDefinition[] = [
  // File search is now always enabled via vectorstore configuration
  // Function tools can be added here as needed
];
