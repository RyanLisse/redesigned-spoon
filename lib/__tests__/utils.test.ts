import { cn } from "../utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2 py-1", "px-3")).toBe("py-1 px-3");
  });

  it("should handle conditional classes", () => {
    expect(cn("px-2", "py-1", false)).toBe("px-2 py-1");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn(null, undefined, false)).toBe("");
  });

  it("should merge conflicting Tailwind classes", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("should preserve non-conflicting classes", () => {
    expect(cn("px-2", "py-1", "text-red-500")).toBe("px-2 py-1 text-red-500");
  });
});
