import {
  createReasoningSummary,
  formatDuration,
  parseReasoningIntoSteps,
} from "../reasoning-parser";

describe("reasoning-parser", () => {
  describe("parseReasoningIntoSteps", () => {
    it("should parse basic reasoning text into steps", () => {
      const reasoningText = `
Analyzing the user's request
Looking at the available data
Evaluating different options
Concluding with the best approach
      `.trim();

      const steps = parseReasoningIntoSteps(reasoningText);

      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          label: expect.any(String),
          description: expect.any(String),
          content: expect.any(String),
          status: "complete",
        })
      );
    });

    it("should handle empty reasoning text", () => {
      const steps = parseReasoningIntoSteps("");
      expect(steps).toEqual([]);
    });

    it("should handle single line reasoning", () => {
      const steps = parseReasoningIntoSteps("Analyzing the problem");
      expect(steps).toHaveLength(1);
      expect(steps[0].content).toBe("Analyzing the problem");
    });

    it("should combine multiple lines appropriately", () => {
      const reasoningText = `
Analyzing the user's request in detail
This requires careful consideration
of multiple factors

Searching for relevant information
in the knowledge base
      `.trim();

      const steps = parseReasoningIntoSteps(reasoningText);

      expect(steps.length).toBeGreaterThanOrEqual(1);
      expect(steps.some((step) => step.content.includes("Analyzing"))).toBe(
        true
      );
    });

    it("should truncate long descriptions", () => {
      const longText = `Analyzing ${"a".repeat(100)} the problem`;
      const steps = parseReasoningIntoSteps(longText);

      expect(steps[0].description.length).toBeLessThanOrEqual(53); // 50 + "..."
    });

    it("should generate unique IDs for each step", () => {
      const reasoningText = `
Analyzing the problem
Evaluating solutions
Concluding with recommendation
      `.trim();

      const steps = parseReasoningIntoSteps(reasoningText);
      const ids = steps.map((step) => step.id);

      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("pattern recognition", () => {
    it("should recognize analysis patterns in steps", () => {
      const analysisText = "Analyzing the data to understand the problem";
      const steps = parseReasoningIntoSteps(analysisText);

      expect(steps).toHaveLength(1);
      expect(steps[0].label).toBe("Analysis");
    });

    it("should recognize search patterns in steps", () => {
      const searchText = "Searching for relevant information in the database";
      const steps = parseReasoningIntoSteps(searchText);

      expect(steps).toHaveLength(1);
      expect(steps[0].label).toBe("Search");
    });

    it("should recognize evaluation patterns in steps", () => {
      const evaluationText = "Evaluating the different options available";
      const steps = parseReasoningIntoSteps(evaluationText);

      expect(steps).toHaveLength(1);
      expect(steps[0].label).toBe("Evaluation");
    });

    it("should recognize synthesis patterns in steps", () => {
      const synthesisText = "Combining the results from multiple sources";
      const steps = parseReasoningIntoSteps(synthesisText);

      expect(steps).toHaveLength(1);
      expect(steps[0].label).toBe("Synthesis");
    });

    it("should recognize conclusion patterns in steps", () => {
      const conclusionText = "Therefore, the answer is option B";
      const steps = parseReasoningIntoSteps(conclusionText);

      expect(steps).toHaveLength(1);
      expect(steps[0].label).toBe("Conclusion");
    });

    it("should recognize tool patterns in steps", () => {
      const toolText = "Using tool to fetch the weather data";
      const steps = parseReasoningIntoSteps(toolText);

      expect(steps).toHaveLength(1);
      expect(steps[0].label).toBe("Tool");
    });

    it("should default to 'Reasoning' for unmatched patterns", () => {
      const randomText = "Just thinking about this problem";
      const steps = parseReasoningIntoSteps(randomText);

      expect(steps).toHaveLength(1);
      expect(steps[0].label).toBe("Reasoning");
    });
  });

  describe("createReasoningSummary", () => {
    it("should generate summary with total duration", () => {
      const summary = createReasoningSummary("Analyzing the problem", 1500, [
        { tool_type: "file_search_call" },
      ]);

      expect(summary.totalDuration).toBe(1500);
      expect(summary.steps.length).toBeGreaterThan(0);
    });

    it("should detect file search usage", () => {
      const summary = createReasoningSummary("Searching for files", undefined, [
        { tool_type: "file_search_call" },
      ]);

      expect(summary.toolUsage?.fileSearch).toBe(true);
    });

    it("should detect function usage", () => {
      const summary = createReasoningSummary(
        "Calling function get_weather",
        undefined,
        [{ tool_type: "function_call", name: "get_weather" }]
      );

      expect(summary.toolUsage?.functions).toContain("get_weather");
    });

    it("should detect MCP usage", () => {
      const summary = createReasoningSummary(
        "Using MCP tool to access data",
        undefined,
        [{ tool_type: "mcp_call" }]
      );

      expect(summary.toolUsage?.mcp).toBe(true);
    });

    it("should count sources mentioned", () => {
      const summary = createReasoningSummary(
        "According to document.pdf",
        undefined,
        [{ tool_type: "file_search_call" }]
      );

      expect(summary.sources).toBe(1);
    });

    it("should handle steps without durations", () => {
      const summary = createReasoningSummary("Simple reasoning");

      expect(summary.totalDuration).toBeUndefined();
    });

    it("should handle empty reasoning", () => {
      const summary = createReasoningSummary("");

      expect(summary.steps).toHaveLength(0);
      expect(summary.totalDuration).toBeUndefined();
      expect(summary.toolUsage?.fileSearch).toBe(false);
      expect(summary.toolUsage?.functions).toEqual([]);
      expect(summary.toolUsage?.mcp).toBe(false);
      expect(summary.sources).toBe(0);
    });

    it("should extract multiple function names", () => {
      const summary = createReasoningSummary(
        "Using multiple functions",
        undefined,
        [
          { tool_type: "function_call", name: "get_weather" },
          { tool_type: "function_call", name: "get_news" },
          { tool_type: "function_call", name: "calculate_sum" },
        ]
      );

      expect(summary.toolUsage?.functions).toContain("get_weather");
      expect(summary.toolUsage?.functions).toContain("get_news");
      expect(summary.toolUsage?.functions).toContain("calculate_sum");
      expect(summary.toolUsage?.functions).toHaveLength(3);
    });
  });

  describe("formatDuration", () => {
    it("should format milliseconds", () => {
      expect(formatDuration(500)).toBe("500ms");
      expect(formatDuration(999)).toBe("999ms");
    });

    it("should format seconds", () => {
      expect(formatDuration(1000)).toBe("1s");
      expect(formatDuration(5500)).toBe("6s");
      expect(formatDuration(30_000)).toBe("30s");
    });

    it("should format minutes and seconds", () => {
      expect(formatDuration(60_000)).toBe("1m 0s");
      expect(formatDuration(90_000)).toBe("1m 30s");
      expect(formatDuration(125_000)).toBe("2m 5s");
    });

    it("should handle zero duration", () => {
      expect(formatDuration(0)).toBe("0ms");
    });

    it("should handle large durations", () => {
      expect(formatDuration(3_600_000)).toBe("60m 0s"); // 1 hour
    });
  });

  describe("integration tests", () => {
    it("should handle complete reasoning flow", () => {
      const complexReasoning = `
I need to analyze this request carefully.

First, I'll search for relevant information in the uploaded documents.
Using file_search tool to find related content.

Now I'm evaluating the different options based on what I found.
The data shows several possible approaches.

Let me call the get_weather function to get current conditions.
This will help inform my recommendation.

Combining all the information from document.pdf and analysis.txt.
The synthesis shows a clear pattern.

Therefore, based on my analysis, the recommended approach is option B.
This conclusion is supported by the evidence found.
      `.trim();

      const steps = parseReasoningIntoSteps(complexReasoning);
      const summary = createReasoningSummary(complexReasoning, undefined, [
        { tool_type: "file_search_call" },
        { tool_type: "function_call", name: "get_weather" },
      ]);

      expect(steps.length).toBeGreaterThan(0);
      expect(summary.toolUsage?.fileSearch).toBe(true);
      expect(summary.toolUsage?.functions).toContain("get_weather");
      expect(summary.sources).toBeGreaterThan(0);

      const labels = steps.map((step) => step.label);
      expect(
        labels.some(
          (label) => label.includes("Analysis") || label.includes("Reasoning")
        )
      ).toBe(true);
    });
  });
});
