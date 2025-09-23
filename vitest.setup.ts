import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";
import { HTTP_STATUS } from "@/config/constants";

// Type definitions for mock components
type MockComponentProps = {
  children?: React.ReactNode;
  [key: string]: unknown;
};

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  useSearchParams() {
    return {
      get: vi.fn(),
    };
  },
  usePathname() {
    return "";
  },
}));

// Mock environment variables
process.env.OPENAI_API_KEY = "test-api-key";

// Mock react-markdown and related ESM modules
vi.mock(
  "react-markdown",
  () =>
    function ReactMarkdown({ children, ...props }: MockComponentProps) {
      return React.createElement(
        "div",
        { ...props, "data-testid": "react-markdown" },
        children
      );
    }
);

vi.mock("streamdown", () => ({
  // biome-ignore lint/style/useNamingConvention: Component name follows React convention
  Markdown: ({ children, ...props }: MockComponentProps) =>
    React.createElement(
      "div",
      { ...props, "data-testid": "streamdown-markdown" },
      children
    ),
}));

// Mock global Request and Response for API route tests
// Note: NextRequest extends Request, so we only need to ensure Request is available
if (typeof global.Request === "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: Global mock requires any type
  // biome-ignore lint/style/useNamingConvention: Global Request interface
  (global as typeof globalThis & { Request: any }).Request = class MockRequest {
    url: string;
    method: string;
    headers: Headers;
    body: BodyInit | null;
    cache: RequestCache = "default";
    credentials: RequestCredentials = "same-origin";
    destination: RequestDestination = "";
    integrity = "";
    keepalive = false;
    mode: RequestMode = "cors";
    redirect: RequestRedirect = "follow";
    referrer = "";
    referrerPolicy: ReferrerPolicy = "";
    signal: AbortSignal = new AbortController().signal;
    bodyUsed = false;

    constructor(url: string | URL, options: RequestInit = {}) {
      this.url = url.toString();
      this.method = options.method || "GET";
      this.headers = new Headers(options.headers);
      this.body = options.body || null;
    }

    json() {
      return Promise.resolve(JSON.parse((this.body as string) || "{}"));
    }

    text() {
      return Promise.resolve((this.body as string) || "");
    }

    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }

    blob() {
      return Promise.resolve(new Blob([(this.body as string) || ""]));
    }

    formData() {
      return Promise.resolve(new FormData());
    }

    clone() {
      return new (this.constructor as typeof MockRequest)(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
      });
    }
  };
}

if (typeof global.Response === "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: Global mock requires any type
  // biome-ignore lint/style/useNamingConvention: Global Response interface
  (global as typeof globalThis & { Response: any }).Response =
    class MockResponse {
      body: ReadableStream | null;
      status: number;
      statusText: string;
      headers: Headers;
      ok: boolean;
      redirected = false;
      type: ResponseType = "basic";
      url = "";
      bodyUsed = false;

      private _body: BodyInit | null;

      constructor(body?: BodyInit | null, options: ResponseInit = {}) {
        this._body = body || null;
        this.body = null; // Simplified for testing
        this.status = options.status || HTTP_STATUS.OK;
        this.statusText = options.statusText || "OK";
        this.headers = new Headers(options.headers);
        this.ok =
          this.status >= HTTP_STATUS.OK &&
          this.status < HTTP_STATUS.MULTIPLE_CHOICES;
      }

      static json(data: unknown, options: ResponseInit = {}) {
        return new MockResponse(JSON.stringify(data), {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });
      }

      json() {
        try {
          return Promise.resolve(JSON.parse((this._body as string) || "{}"));
        } catch (_error) {
          // If body is not valid JSON, return it as an object with error property
          return Promise.resolve({ error: this._body });
        }
      }

      text() {
        return Promise.resolve(this._body?.toString() || "");
      }

      arrayBuffer() {
        return Promise.resolve(new ArrayBuffer(0));
      }

      blob() {
        return Promise.resolve(new Blob([(this._body as string) || ""]));
      }

      formData() {
        return Promise.resolve(new FormData());
      }

      clone() {
        return new (this.constructor as typeof MockResponse)(this._body, {
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
        });
      }
    };
}

// Mock ReadableStream for streaming API responses
if (typeof global.ReadableStream === "undefined") {
  // biome-ignore lint/suspicious/noExplicitAny: Global mock requires any type
  // biome-ignore lint/style/useNamingConvention: Global ReadableStream interface
  (global as typeof globalThis & { ReadableStream: any }).ReadableStream =
    class MockReadableStream {
      locked = false;
      chunks: unknown[] = [];
      controller: ReadableStreamDefaultController<unknown>;

      constructor(underlyingSource?: UnderlyingSource) {
        this.chunks = [];
        this.controller = {
          enqueue: (chunk: unknown) => {
            this.chunks.push(chunk);
          },
          close: vi.fn(),
          error: vi.fn(),
          desiredSize: 1,
        };

        if (underlyingSource?.start) {
          // Execute start function immediately for testing
          underlyingSource.start(this.controller);
        }
      }

      getReader(): ReadableStreamDefaultReader {
        let index = 0;
        this.locked = true;
        return {
          read: vi.fn().mockImplementation(() => {
            if (index < this.chunks.length) {
              return Promise.resolve({
                done: false,
                value: this.chunks[index++],
              });
            }
            return Promise.resolve({ done: true, value: undefined });
          }),
          releaseLock: vi.fn().mockImplementation(() => {
            this.locked = false;
          }),
          cancel: vi.fn(),
          closed: Promise.resolve(undefined),
        } as ReadableStreamDefaultReader;
      }

      cancel() {
        return Promise.resolve(undefined);
      }

      pipeTo() {
        return Promise.resolve(undefined);
      }

      pipeThrough() {
        return this;
      }

      tee(): [ReadableStream, ReadableStream] {
        return [this as ReadableStream, this as ReadableStream];
      }
    };
}
