import OpenAi from "openai";

const openai = new OpenAi();

export async function POST(request: Request) {
  const { vectorStoreId, fileId } = await request.json();
  try {
    const vectorStore = await openai.vectorStores.files.create(vectorStoreId, {
      // biome-ignore lint/style/useNamingConvention: OpenAI API expects file_id
      file_id: fileId,
    });
    return new Response(JSON.stringify(vectorStore), { status: 200 });
  } catch (_error) {
    return new Response("Error adding file", { status: 500 });
  }
}
