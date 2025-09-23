#!/usr/bin/env node

/**
 * Quick script to check vectorstore contents
 */

import OpenAi from "openai";

const openai = new OpenAi();
const VECTORSTORE_ID = process.env.OPENAI_VECTORSTORE_ID;

async function checkVectorStore() {
  try {
    console.log(`📁 Checking vectorstore: ${VECTORSTORE_ID}`);

    const files = await openai.vectorStores.files.list(VECTORSTORE_ID);
    console.log(`📊 Found ${files.data.length} files:`);

    if (files.data.length === 0) {
      console.log("❌ Vectorstore is empty!");
      console.log("💡 Run: make upload-docs");
    } else {
      files.data.forEach((file, index) => {
        console.log(
          `${index + 1}. ${file.filename || "Unknown"} (${file.id}) - Status: ${file.status}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error checking vectorstore:", error.message);
  }
}

checkVectorStore();
