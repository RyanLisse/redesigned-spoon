import { type FunctionHandler, functionsMap } from "../../config/functions";

type ToolName = keyof typeof functionsMap;

export const handleTool = async (toolName: ToolName, parameters: any) => {
  const handler: FunctionHandler | undefined = functionsMap[toolName];
  if (handler) {
    return await handler(parameters);
  }
  throw new Error(`Unknown tool: ${toolName}`);
};
