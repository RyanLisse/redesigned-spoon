import { isReasoningModel, MODELS } from "../models";

describe("models", () => {
  describe("MODELS", () => {
    it("should contain predefined models", () => {
      expect(MODELS).toBeInstanceOf(Array);
      expect(MODELS.length).toBeGreaterThan(0);

      // Check that each model has required properties
      MODELS.forEach((model) => {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("reasoning");
        expect(typeof model.id).toBe("string");
        expect(typeof model.reasoning).toBe("boolean");
      });
    });

    it("should have correct model structure", () => {
      const gpt5Mini = MODELS.find((m) => m.id === "gpt-5-mini");
      expect(gpt5Mini).toBeDefined();
      expect(gpt5Mini?.label).toBe("GPT-5 Mini");
      expect(gpt5Mini?.reasoning).toBe(true);
    });
  });

  describe("isReasoningModel", () => {
    it("should return true for reasoning models", () => {
      // Based on the actual model list
      expect(isReasoningModel("gpt-5-mini")).toBe(true);
      expect(isReasoningModel("gpt-5-nano")).toBe(true);
    });

    it("should return false for non-reasoning models", () => {
      expect(isReasoningModel("gpt-4.1")).toBe(false);
      expect(isReasoningModel("gpt-5")).toBe(false);
      expect(isReasoningModel("gpt-4o-mini")).toBe(false);
    });

    it("should return false for unknown models", () => {
      expect(isReasoningModel("unknown-model")).toBe(false);
      expect(isReasoningModel("gpt-3.5-turbo")).toBe(false);
      expect(isReasoningModel("claude-3")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isReasoningModel("")).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isReasoningModel(undefined as any)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isReasoningModel(null as any)).toBe(false);
    });

    it("should be case sensitive", () => {
      expect(isReasoningModel("GPT-5-MINI")).toBe(false);
      expect(isReasoningModel("Gpt-5-Mini")).toBe(false);
    });

    it("should handle exact string matching", () => {
      expect(isReasoningModel("gpt-5-mini-extra")).toBe(false);
      expect(isReasoningModel("prefix-gpt-5-mini")).toBe(false);
      expect(isReasoningModel(" gpt-5-mini")).toBe(false);
      expect(isReasoningModel("gpt-5-mini ")).toBe(false);
    });

    it("should work with all defined models", () => {
      const reasoningModels = MODELS.filter((m) => m.reasoning);
      const nonReasoningModels = MODELS.filter((m) => !m.reasoning);

      reasoningModels.forEach((model) => {
        expect(isReasoningModel(model.id)).toBe(true);
      });

      nonReasoningModels.forEach((model) => {
        expect(isReasoningModel(model.id)).toBe(false);
      });
    });

    it("should handle special characters", () => {
      expect(isReasoningModel("gpt-5@mini")).toBe(false);
      expect(isReasoningModel("gpt_5_mini")).toBe(false);
      expect(isReasoningModel("gpt.5.mini")).toBe(false);
    });

    it("should handle numbers and mixed content", () => {
      expect(isReasoningModel("123")).toBe(false);
      expect(isReasoningModel("gpt5mini")).toBe(false);
      expect(isReasoningModel("5")).toBe(false);
    });

    it("should validate exact model IDs from the models list", () => {
      const modelIds = [
        "gpt-4.1",
        "gpt-5",
        "gpt-5-mini",
        "gpt-5-nano",
        "gpt-4o-mini",
      ];

      modelIds.forEach((modelId) => {
        const model = MODELS.find((m) => m.id === modelId);
        expect(model).toBeDefined();
        expect(isReasoningModel(modelId)).toBe(model?.reasoning === true);
      });
    });
  });
});
