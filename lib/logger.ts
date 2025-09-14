import type { Logger, LoggerOptions } from "pino";
import pino from "pino";

const level =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

function createBaseLogger(options: LoggerOptions = {}): Logger {
  return pino({ level, ...options });
}

// In Next.js, using the `transport` option spawns a worker thread (thread-stream)
// which can fail under bundling, causing runtime crashes. To keep pretty logs in
// development without workers, pipe through pino-pretty as a destination stream.
let logger: Logger;

if (process.env.NODE_ENV !== "production") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- CommonJS module
    const pretty = require("pino-pretty");
    const stream = pretty({ colorize: true, singleLine: false });
    logger = pino({ level }, stream);
  } catch {
    // Fallback to plain JSON logs if pino-pretty is unavailable
    logger = createBaseLogger();
  }
} else {
  logger = createBaseLogger();
}

export default logger;
