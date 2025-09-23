import type { ToolDefinition } from "../tools-list";
import { toolsList } from "../tools-list";

describe("toolsList configuration", () => {
  it("should be an array", () => {
    expect(Array.isArray(toolsList)).toBe(true);
  });

  it("should be empty by default", () => {
    expect(toolsList).toHaveLength(0);
  });

  it("should export ToolDefinition type", () => {
    // Test that we can create a valid ToolDefinition
    const validTool: ToolDefinition = {
      name: "testTool",
      description: "A test tool for validation",
      parameters: {
        param1: {
          type: "string",
          description: "Test parameter",
        },
        param2: {
          type: "number",
          enum: ["1", "2", "3"],
        },
      },
    };

    expect(validTool.name).toBe("testTool");
    expect(validTool.description).toBe("A test tool for validation");
    expect(validTool.parameters.param1.type).toBe("string");
    expect(validTool.parameters.param2.enum).toEqual(["1", "2", "3"]);
  });

  it("should support tools with no parameters", () => {
    const simpleTool: ToolDefinition = {
      name: "simpleTool",
      description: "A simple tool",
      parameters: {},
    };

    expect(Object.keys(simpleTool.parameters)).toHaveLength(0);
  });

  it("should support optional parameter properties", () => {
    const toolWithOptionalProps: ToolDefinition = {
      name: "optionalTool",
      description: "Tool with optional properties",
      parameters: {
        requiredParam: {
          type: "string",
        },
        optionalParam: {
          type: "string",
          description: "This is optional",
          enum: ["option1", "option2"],
        },
      },
    };

    expect(
      toolWithOptionalProps.parameters.requiredParam.description
    ).toBeUndefined();
    expect(
      toolWithOptionalProps.parameters.optionalParam.description
    ).toBeDefined();
  });
});
