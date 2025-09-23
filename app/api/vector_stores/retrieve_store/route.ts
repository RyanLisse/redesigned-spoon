import OpenAi from "openai";

const openai = new OpenAi();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vectorStoreId = searchParams.get("vector_store_id");
  try {
    const vectorStore = await openai.vectorStores.retrieve(vectorStoreId || "");
    return new Response(JSON.stringify(vectorStore), { status: 200 });
  } catch (_error) {
    return new Response("Error fetching vector store", { status: 500 });
  }
}
