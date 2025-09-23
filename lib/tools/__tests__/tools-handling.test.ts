import { vi } from "vitest";
import { handleTool } from "../tools-handling";

// Mock the functionsMap with real test tools
vi.mock("../../../config/functions", () => ({
  functionsMap: {
    testTool: vi.fn().mockResolvedValue({ success: true, data: "test result" }),
    asyncTool: vi.fn().mockResolvedValue({ result: "async success" }),
    file_search: vi
      .fn()
      .mockResolvedValue({ answer: "test search result", citations: [] }),
  },
  type: {} as any,
}));

describe("handleTool", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.log for cleaner test output without clearing the module mocks
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    // Only restore the console spy, not module mocks
    consoleLogSpy?.mockRestore();
  });

  it("should execute a valid tool and return result", async () => {
    const parameters = { param1: "value1", param2: "value2" };
    const result = await handleTool("testTool", parameters);

    expect(result).toEqual({ success: true, data: "test result" });
  });

  it("should handle async tools", async () => {
    const parameters = { input: "async test" };
    const result = await handleTool("asyncTool", parameters);

    expect(result).toEqual({ result: "async success" });
  });

  it("should throw error for unknown tool", async () => {
    await expect(handleTool("unknownTool" as any, {})).rejects.toThrow(
      "Unknown tool: unknownTool"
    );
  });

  it("should pass parameters correctly to tool function", async () => {
    const { functionsMap } = (await vi.importMock(
      "../../../config/functions"
    )) as any;
    const parameters = { test: "data", number: 42 };

    await handleTool("testTool", parameters);

    expect(functionsMap.testTool).toHaveBeenCalledWith(parameters);
  });

  it("should handle tools with no parameters", async () => {
    const result = await handleTool("testTool", undefined);

    expect(result).toEqual({ success: true, data: "test result" });
  });

  it("should handle tools with debug parameters", async () => {
    const parameters = { debug: true };
    const result = await handleTool("testTool", parameters);

    expect(result).toEqual({ success: true, data: "test result" });
  });
});
