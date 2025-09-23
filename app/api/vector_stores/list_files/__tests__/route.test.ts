import { NextRequest } from "next/server";
import { vi } from "vitest";
import { HTTP_STATUS, TEST_CONSTANTS } from "@/config/constants";

// Mock OpenAI before importing the route
const mockVectorStoresList = vi.fn();

vi.mock("openai", () => {
  const mockList = vi.fn();
  // Share the mock function reference
  mockList.mockImplementation((...args) => mockVectorStoresList(...args));

  return {
    __esModule: true,
    default: vi.fn(() => ({
      beta: {
        vectorStores: {
          files: {
            list: mockList,
          },
        },
      },
    })),
  };
});

import { GET } from "../route";

describe("/api/vector_stores/list_files", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list files from vector store", async () => {
    const mockFiles = {
      data: [
        {
          id: "file_123",
          object: "vector_store.file",
          usageBytes: 1024,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          created_at: 1_234_567_890,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          vector_store_id: "vs_456",
          status: "completed",
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          last_error: null,
        },
        {
          id: "file_789",
          object: "vector_store.file",
          usageBytes: 2048,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          created_at: 1_234_567_891,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          vector_store_id: "vs_456",
          status: "completed",
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          last_error: null,
        },
      ],
      object: "list",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      first_id: "file_123",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      last_id: "file_789",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      has_more: false,
    };

    mockVectorStoresList.mockResolvedValue(mockFiles);

    const request = new NextRequest(
      "http://localhost/api/vector_stores/list_files?vector_store_id=vs_456"
    );

    const response = await GET(request);

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(mockVectorStoresList).toHaveBeenCalledWith("vs_456");

    const responseData = await response.json();
    expect(responseData).toEqual(mockFiles);
  });

  it("should handle missing vector_store_id parameter", async () => {
    const request = new NextRequest(
      "http://localhost/api/vector_stores/list_files"
    );

    const response = await GET(request);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: "vector_store_id is required",
    });
  });

  it("should handle empty vector_store_id parameter", async () => {
    const request = new NextRequest(
      "http://localhost/api/vector_stores/list_files?vector_store_id="
    );

    const response = await GET(request);

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: "vector_store_id is required",
    });
  });

  it("should handle OpenAI API errors", async () => {
    const error = new Error("Vector store not found") as Error & {
      status: number;
    };
    error.status = HTTP_STATUS.NOT_FOUND;
    mockVectorStoresList.mockRejectedValue(error);

    const request = new NextRequest(
      "http://localhost/api/vector_stores/list_files?vector_store_id=vs_nonexistent"
    );

    const response = await GET(request);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const responseData = await response.json();
    expect(responseData).toEqual({
      error: "Vector store not found",
    });
  });

  it("should handle empty file list", async () => {
    const mockEmptyFiles = {
      data: [],
      object: "list",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      first_id: null,
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      last_id: null,
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      has_more: false,
    };

    mockVectorStoresList.mockResolvedValue(mockEmptyFiles);

    const request = new NextRequest(
      "http://localhost/api/vector_stores/list_files?vector_store_id=vs_empty"
    );

    const response = await GET(request);

    expect(response.status).toBe(HTTP_STATUS.OK);
    const responseData = await response.json();
    expect(responseData).toEqual(mockEmptyFiles);
    expect(responseData.data).toHaveLength(0);
  });

  it("should handle files with different statuses", async () => {
    const mockFiles = {
      data: [
        {
          id: "file_completed",
          object: "vector_store.file",
          usageBytes: 1024,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          created_at: 1_234_567_890,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          vector_store_id: "vs_456",
          status: "completed",
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          last_error: null,
        },
        {
          id: "file_in_progress",
          object: "vector_store.file",
          usageBytes: 0,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          created_at: 1_234_567_891,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          vector_store_id: "vs_456",
          status: "in_progress",
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          last_error: null,
        },
        {
          id: "file_failed",
          object: "vector_store.file",
          usageBytes: 0,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          created_at: 1_234_567_892,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          vector_store_id: "vs_456",
          status: "failed",
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          last_error: {
            code: "processing_error",
            message: "File could not be processed",
          },
        },
      ],
      object: "list",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      first_id: "file_completed",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      last_id: "file_failed",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      has_more: false,
    };

    mockVectorStoresList.mockResolvedValue(mockFiles);

    const request = new NextRequest(
      "http://localhost/api/vector_stores/list_files?vector_store_id=vs_456"
    );

    const response = await GET(request);

    expect(response.status).toBe(HTTP_STATUS.OK);
    const responseData = await response.json();
    expect(responseData.data).toHaveLength(TEST_CONSTANTS.EXPECTED_FILE_COUNT);
    expect(responseData.data[0].status).toBe("completed");
    expect(responseData.data[1].status).toBe("in_progress");
    expect(responseData.data[2].status).toBe("failed");
    expect(responseData.data[2].last_error).toBeDefined();
  });

  it("should handle pagination parameters", async () => {
    const mockFiles = {
      data: [
        {
          id: "file_1",
          object: "vector_store.file",
          usageBytes: 1024,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          created_at: 1_234_567_890,
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          vector_store_id: "vs_456",
          status: "completed",
          // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
          last_error: null,
        },
      ],
      object: "list",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      first_id: "file_1",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      last_id: "file_1",
      // biome-ignore lint/style/useNamingConvention: OpenAI API uses snake_case
      has_more: true,
    };

    mockVectorStoresList.mockResolvedValue(mockFiles);

    const request = new NextRequest(
      "http://localhost/api/vector_stores/list_files?vector_store_id=vs_456&limit=1&after=file_0"
    );

    const response = await GET(request);

    expect(response.status).toBe(HTTP_STATUS.OK);
    const responseData = await response.json();
    expect(responseData.has_more).toBe(true);
  });

  it("should handle unknown errors gracefully", async () => {
    const unknownError = "Something went wrong";
    mockVectorStoresList.mockRejectedValue(unknownError);

    const request = new NextRequest(
      "http://localhost/api/vector_stores/list_files?vector_store_id=vs_456"
    );

    const response = await GET(request);
    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  });
});
