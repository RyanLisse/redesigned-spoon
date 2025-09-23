import OpenAi from "openai";

const openai = new OpenAi();

export async function POST(request: Request) {
  const { name } = await request.json();
  try {
    const vectorStore = await openai.vectorStores.create({
      name,
    });
    return new Response(JSON.stringify(vectorStore), { status: 200 });
  } catch (_error) {
    return new Response("Error creating vector store", { status: 500 });
  }
}
