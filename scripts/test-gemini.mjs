#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('🔍 Listing available models...\n');

try {
  const models = await genAI.listModels();

  console.log(`✅ Found ${models.length} models:\n`);

  for (const model of models) {
    console.log(`- ${model.name}`);
    console.log(`  Display Name: ${model.displayName}`);
    console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
    console.log('');
  }
} catch (error) {
  console.error('❌ Error listing models:', error.message);
  process.exit(1);
}
