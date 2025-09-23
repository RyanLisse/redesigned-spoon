import type { FunctionHandler } from "../functions";
import { functionsMap } from "../functions";

describe("functionsMap configuration", () => {
  it("should be an object", () => {
    expect(typeof functionsMap).toBe("object");
    expect(functionsMap).not.toBeNull();
  });

  it("should include file_search function", () => {
    expect(Object.keys(functionsMap)).toContain("file_search");
    expect(typeof functionsMap.file_search).toBe("function");
  });

  it("should support FunctionHandler type", async () => {
    // Test that we can create a valid FunctionHandler
    const testHandler: FunctionHandler = async (parameters: any) => ({
      success: true,
      data: parameters,
    });

    const result = await testHandler({ test: "value" });
    expect(result).toEqual({ success: true, data: { test: "value" } });
  });

  it("should support async function handlers", async () => {
    const asyncHandler: FunctionHandler = async (parameters: any) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      return { processed: true, input: parameters };
    };

    const result = await asyncHandler({ async: "test" });
    expect(result).toEqual({ processed: true, input: { async: "test" } });
  });

  it("should support handlers that return different types", async () => {
    const stringHandler: FunctionHandler = async () => "string result";
    const objectHandler: FunctionHandler = async () => ({ complex: "object" });
    const arrayHandler: FunctionHandler = async () => [1, 2, 3];

    expect(await stringHandler({})).toBe("string result");
    expect(await objectHandler({})).toEqual({ complex: "object" });
    expect(await arrayHandler({})).toEqual([1, 2, 3]);
  });

  it("should support handlers with no parameters", async () => {
    const noParamHandler: FunctionHandler = async () => ({
      timestamp: Date.now(),
    });

    const result = await noParamHandler(undefined);
    expect(result).toHaveProperty("timestamp");
    expect(typeof result.timestamp).toBe("number");
  });

  it("should support error handling in handlers", async () => {
    const errorHandler: FunctionHandler = async (parameters: any) => {
      if (parameters?.shouldError) {
        throw new Error("Test error");
      }
      return { success: true };
    };

    await expect(errorHandler({ shouldError: true })).rejects.toThrow(
      "Test error"
    );
    await expect(errorHandler({ shouldError: false })).resolves.toEqual({
      success: true,
    });
  });
});
