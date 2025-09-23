import { act, renderHook } from "@testing-library/react";
import useUiStore from "../use-ui-store";

describe("useUiStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useUiStore());
    act(() => {
      result.current.setModelId("gpt-4");
      result.current.setReasoningEffort("medium");
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useUiStore());

    expect(result.current.modelId).toBe("gpt-4");
    expect(result.current.reasoningEffort).toBe("medium");
  });

  it("should set model ID", () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.setModelId("gpt-3.5-turbo");
    });

    expect(result.current.modelId).toBe("gpt-3.5-turbo");

    act(() => {
      result.current.setModelId("o1-preview");
    });

    expect(result.current.modelId).toBe("o1-preview");
  });

  it("should set reasoning effort", () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.setReasoningEffort("low");
    });

    expect(result.current.reasoningEffort).toBe("low");

    act(() => {
      result.current.setReasoningEffort("high");
    });

    expect(result.current.reasoningEffort).toBe("high");

    act(() => {
      result.current.setReasoningEffort("medium");
    });

    expect(result.current.reasoningEffort).toBe("medium");
  });

  it("should handle model changes", () => {
    const { result } = renderHook(() => useUiStore());

    const models = [
      "gpt-4",
      "gpt-3.5-turbo",
      "o1-preview",
      "o1-mini",
      "gpt-4-turbo",
    ];

    models.forEach((model) => {
      act(() => {
        result.current.setModelId(model);
      });
      expect(result.current.modelId).toBe(model);
    });
  });

  it("should handle reasoning effort changes", () => {
    const { result } = renderHook(() => useUiStore());

    const efforts: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];

    efforts.forEach((effort) => {
      act(() => {
        result.current.setReasoningEffort(effort);
      });
      expect(result.current.reasoningEffort).toBe(effort);
    });
  });

  it("should maintain state independently", () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.setModelId("o1-preview");
      result.current.setReasoningEffort("high");
    });

    expect(result.current.modelId).toBe("o1-preview");
    expect(result.current.reasoningEffort).toBe("high");

    // Change only model ID
    act(() => {
      result.current.setModelId("gpt-4");
    });

    expect(result.current.modelId).toBe("gpt-4");
    expect(result.current.reasoningEffort).toBe("high"); // Should remain unchanged

    // Change only reasoning effort
    act(() => {
      result.current.setReasoningEffort("low");
    });

    expect(result.current.modelId).toBe("gpt-4"); // Should remain unchanged
    expect(result.current.reasoningEffort).toBe("low");
  });

  it("should work with concurrent updates", () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.setModelId("gpt-3.5-turbo");
      result.current.setReasoningEffort("high");
    });

    expect(result.current.modelId).toBe("gpt-3.5-turbo");
    expect(result.current.reasoningEffort).toBe("high");
  });

  it("should handle string model IDs correctly", () => {
    const { result } = renderHook(() => useUiStore());

    const customModelId = "custom-model-v1";

    act(() => {
      result.current.setModelId(customModelId);
    });

    expect(result.current.modelId).toBe(customModelId);
    expect(typeof result.current.modelId).toBe("string");
  });

  it("should maintain immutability", () => {
    const { result } = renderHook(() => useUiStore());

    const initialModelId = result.current.modelId;
    const initialReasoningEffort = result.current.reasoningEffort;

    act(() => {
      result.current.setModelId("new-model");
      result.current.setReasoningEffort("high");
    });

    // Original values should not have changed
    expect(initialModelId).toBe("gpt-4");
    expect(initialReasoningEffort).toBe("medium");

    // New values should be updated
    expect(result.current.modelId).toBe("new-model");
    expect(result.current.reasoningEffort).toBe("high");
  });

  it("should work with TypeScript types correctly", () => {
    const { result } = renderHook(() => useUiStore());

    // These should compile without TypeScript errors
    const modelId: string = result.current.modelId;
    const reasoningEffort: "low" | "medium" | "high" =
      result.current.reasoningEffort;

    expect(typeof modelId).toBe("string");
    expect(["low", "medium", "high"]).toContain(reasoningEffort);
  });

  it("should handle rapid state changes", () => {
    const { result } = renderHook(() => useUiStore());

    // Rapidly change model ID multiple times
    const models = ["model1", "model2", "model3", "model4", "model5"];

    models.forEach((model) => {
      act(() => {
        result.current.setModelId(model);
      });
    });

    expect(result.current.modelId).toBe("model5");

    // Rapidly change reasoning effort multiple times
    const efforts: Array<"low" | "medium" | "high"> = [
      "low",
      "high",
      "medium",
      "low",
      "high",
    ];

    efforts.forEach((effort) => {
      act(() => {
        result.current.setReasoningEffort(effort);
      });
    });

    expect(result.current.reasoningEffort).toBe("high");
  });

  it("should persist state across multiple hook instances", () => {
    const { result: result1 } = renderHook(() => useUiStore());
    const { result: result2 } = renderHook(() => useUiStore());

    // Both hooks should reference the same store
    expect(result1.current.modelId).toBe(result2.current.modelId);
    expect(result1.current.reasoningEffort).toBe(
      result2.current.reasoningEffort
    );

    // Update from first hook
    act(() => {
      result1.current.setModelId("shared-model");
    });

    // Second hook should see the update
    expect(result2.current.modelId).toBe("shared-model");

    // Update from second hook
    act(() => {
      result2.current.setReasoningEffort("low");
    });

    // First hook should see the update
    expect(result1.current.reasoningEffort).toBe("low");
  });
});
