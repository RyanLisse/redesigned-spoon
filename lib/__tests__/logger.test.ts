import { vi } from "vitest";
import logger from "../logger";

// Mock pino
vi.mock("pino", () => {
  const mockLogger: any = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn((): any => mockLogger),
  };
  return {
    default: vi.fn((): any => mockLogger),
  };
});

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(logger).toBeDefined();
  });

  it("should have logging methods", () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.trace).toBeDefined();
    expect(logger.fatal).toBeDefined();
  });

  it("should log info messages", () => {
    const message = "Test info message";
    const data = { key: "value" };

    logger.info(data, message);

    expect(logger.info).toHaveBeenCalledWith(data, message);
  });

  it("should log error messages", () => {
    const message = "Test error message";
    const error = new Error("Test error");

    logger.error({ err: error }, message);

    expect(logger.error).toHaveBeenCalledWith({ err: error }, message);
  });

  it("should log warn messages", () => {
    const message = "Test warning message";
    const data = { warning: true };

    logger.warn(data, message);

    expect(logger.warn).toHaveBeenCalledWith(data, message);
  });

  it("should log debug messages", () => {
    const message = "Test debug message";
    const data = { debug: true };

    logger.debug(data, message);

    expect(logger.debug).toHaveBeenCalledWith(data, message);
  });

  it("should log trace messages", () => {
    const message = "Test trace message";

    logger.trace(message);

    expect(logger.trace).toHaveBeenCalledWith(message);
  });

  it("should log fatal messages", () => {
    const message = "Test fatal message";
    const data = { fatal: true };

    logger.fatal(data, message);

    expect(logger.fatal).toHaveBeenCalledWith(data, message);
  });

  it("should handle logging without data", () => {
    const message = "Simple message";

    logger.info(message);

    expect(logger.info).toHaveBeenCalledWith(message);
  });

  it("should handle complex data objects", () => {
    const complexData = {
      user: { id: 123, name: "John" },
      request: { method: "POST", url: "/api/test" },
      response: { status: 200, data: { success: true } },
      timestamp: new Date().toISOString(),
    };

    logger.info(complexData, "Complex operation completed");

    expect(logger.info).toHaveBeenCalledWith(
      complexData,
      "Complex operation completed"
    );
  });

  it("should handle errors with stack traces", () => {
    const error = new Error("Test error with stack");
    error.stack = "Error: Test error\n    at test.js:1:1";

    logger.error({ err: error, context: "test" }, "Error occurred");

    expect(logger.error).toHaveBeenCalledWith(
      { err: error, context: "test" },
      "Error occurred"
    );
  });

  it("should handle null and undefined values", () => {
    logger.info(null, "Null data");
    logger.info(undefined, "Undefined data");
    logger.info({ value: null }, "Object with null");
    logger.info({ value: undefined }, "Object with undefined");

    expect(logger.info).toHaveBeenCalledTimes(4);
  });

  it("should create child loggers", () => {
    const childLogger = logger.child({ component: "test" });

    expect(logger.child).toHaveBeenCalledWith({ component: "test" });
    expect(childLogger).toBeDefined();
  });

  it("should handle logging arrays", () => {
    const arrayData = [1, 2, 3, "test", { nested: true }];

    logger.info({ data: arrayData }, "Array data logged");

    expect(logger.info).toHaveBeenCalledWith(
      { data: arrayData },
      "Array data logged"
    );
  });

  it("should handle logging with no message", () => {
    const data = { standalone: true };

    logger.info(data);

    expect(logger.info).toHaveBeenCalledWith(data);
  });

  it("should handle multiple arguments", () => {
    logger.info("First arg");

    expect(logger.info).toHaveBeenCalledWith("First arg");
  });

  it("should handle circular references in objects", () => {
    const circularObj: any = { name: "test" };
    circularObj.self = circularObj;

    // Should not throw an error
    expect(() => {
      logger.info({ data: circularObj }, "Circular object");
    }).not.toThrow();

    expect(logger.info).toHaveBeenCalled();
  });

  it("should handle logging numbers and booleans", () => {
    logger.info(42, "Number value");
    logger.info(true, "Boolean value");
    logger.info(false, "Boolean false value");

    expect(logger.info).toHaveBeenCalledWith(42, "Number value");
    expect(logger.info).toHaveBeenCalledWith(true, "Boolean value");
    expect(logger.info).toHaveBeenCalledWith(false, "Boolean false value");
  });

  it("should handle empty strings and objects", () => {
    logger.info("");
    logger.info({});
    logger.info([]);

    expect(logger.info).toHaveBeenCalledWith("");
    expect(logger.info).toHaveBeenCalledWith({});
    expect(logger.info).toHaveBeenCalledWith([]);
  });
});
