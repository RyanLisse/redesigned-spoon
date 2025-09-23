import OpenAi from "openai";
import { HTTP_STATUS } from "@/config/constants";

const openai = new OpenAi();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vectorStoreId = searchParams.get("vector_store_id");

  // Validate required parameter
  if (!vectorStoreId || vectorStoreId.trim() === "") {
    return Response.json(
      { error: "vector_store_id is required" },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  try {
    // biome-ignore lint/suspicious/noExplicitAny: OpenAI SDK beta API requires any cast
    const vectorStore = await (openai.beta as any).vectorStores.files.list(
      vectorStoreId
    );
    return Response.json(vectorStore, { status: HTTP_STATUS.OK });
  } catch (error: unknown) {
    // Handle specific OpenAI API errors
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === HTTP_STATUS.NOT_FOUND
    ) {
      return Response.json(
        { error: "Vector store not found" },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
    return Response.json(
      { error: "Error fetching files" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
