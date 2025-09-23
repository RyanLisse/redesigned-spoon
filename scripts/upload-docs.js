#!/usr/bin/env node

/**
 * Script to upload project documentation to the vectorstore
 * Usage: node scripts/upload-docs.js
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI();

// Vectorstore ID from environment
const VECTORSTORE_ID = process.env.OPENAI_VECTORSTORE_ID;

if (!VECTORSTORE_ID) {
  console.error('❌ OPENAI_VECTORSTORE_ID not found in environment variables');
  process.exit(1);
}

// Files to upload
const DOC_FILES = [
  'README.md',
  'AGENTS.md',
  'ai_docs/ai_sdk_docs.md',
  'docs/browser-echo.md',
];

async function uploadFile(filePath, fileName) {
  try {
    console.log(`📤 Uploading ${fileName}...`);

    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Create file blob
    const fileBlob = new Blob([content], {
      type: 'text/markdown',
    });

    // Upload to OpenAI
    const file = await openai.files.create({
      file: new File([fileBlob], fileName),
      purpose: 'assistants',
    });

    console.log(`✅ Uploaded ${fileName} with ID: ${file.id}`);
    return file.id;
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error);
    return null;
  }
}

async function addFileToVectorStore(fileId, fileName) {
  try {
    console.log(`🔗 Adding ${fileName} to vectorstore...`);

    const result = await openai.vectorStores.files.create(VECTORSTORE_ID, {
      file_id: fileId,
    });

    console.log(`✅ Added ${fileName} to vectorstore`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to add ${fileName} to vectorstore:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting documentation upload to vectorstore...');
  console.log(`📁 Vectorstore ID: ${VECTORSTORE_ID}`);

  const uploadedFiles = [];

  for (const filePath of DOC_FILES) {
    const fullPath = path.join(process.cwd(), filePath);
    const fileName = path.basename(filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }

    // Upload file
    const fileId = await uploadFile(fullPath, fileName);
    if (!fileId) continue;

    // Add to vectorstore
    const result = await addFileToVectorStore(fileId, fileName);
    if (result) {
      uploadedFiles.push({ fileName, fileId });
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successfully uploaded ${uploadedFiles.length} files`);
  uploadedFiles.forEach(({ fileName, fileId }) => {
    console.log(`   • ${fileName} (${fileId})`);
  });

  if (uploadedFiles.length > 0) {
    console.log('\n🎉 Vectorstore is now populated with project documentation!');
    console.log('💡 You can now ask questions about the project and get relevant answers.');
  }
}

// Run the script
main().catch(console.error);
