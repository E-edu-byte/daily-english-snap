#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const dateStr = process.argv[2] || '2026-04-03';

async function getExistingPhrases() {
  const { data } = await supabase.from('phrases').select('phrase').limit(100);
  return data ? data.map(d => d.phrase) : [];
}

async function getProverbForDate(dateStr) {
  const { data } = await supabase
    .from('phrases')
    .select('proverb_english, proverb_japanese')
    .gte('generated_at', `${dateStr}T00:00:00+09:00`)
    .lte('generated_at', `${dateStr}T23:59:59+09:00`)
    .limit(1)
    .single();
  return data ? { english: data.proverb_english, japanese: data.proverb_japanese } : null;
}

async function main() {
  console.log(`📅 Generating for ${dateStr}`);

  const existingPhrases = await getExistingPhrases();
  const proverb = await getProverbForDate(dateStr);
  console.log(`  Proverb: ${proverb?.english || 'None'}`);

  const prompt = `Generate 2 English phrases in JSON format. No explanation, only valid JSON:
{
  "business": {
    "phrase": "a professional business expression",
    "meaning": "Japanese translation",
    "blankWord": "one word for fill-in-the-blank",
    "nuance": "business usage explanation in Japanese (100 chars)",
    "examples": [
      {"english": "A: Question\\nB: Answer with phrase", "japanese": "A: 質問\\nB: 回答"},
      {"english": "A: Question\\nB: Answer with phrase", "japanese": "A: 質問\\nB: 回答"}
    ],
    "quiz": {"question": "quiz question", "options": ["opt1", "opt2", "opt3"], "correct": 0, "explanation": "explanation"}
  },
  "advanced": {
    "phrase": "an advanced idiom or sophisticated expression",
    "meaning": "Japanese translation",
    "blankWord": "one word for fill-in-the-blank",
    "nuance": "advanced usage explanation in Japanese (100 chars)",
    "examples": [
      {"english": "A: Question\\nB: Answer with phrase", "japanese": "A: 質問\\nB: 回答"},
      {"english": "A: Question\\nB: Answer with phrase", "japanese": "A: 質問\\nB: 回答"}
    ],
    "quiz": {"question": "quiz question", "options": ["opt1", "opt2", "opt3"], "correct": 0, "explanation": "explanation"}
  }
}

Avoid these existing phrases: ${existingPhrases.slice(0, 30).join(', ')}

Output ONLY valid JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  console.log('Raw response:', text.substring(0, 500));

  const data = JSON.parse(text);
  const generatedAt = new Date(`${dateStr}T03:00:00Z`).toISOString();

  for (const level of ['business', 'advanced']) {
    const phraseData = data[level];
    const record = {
      phrase: phraseData.phrase,
      meaning: phraseData.meaning,
      blank_word: phraseData.blankWord,
      nuance: phraseData.nuance,
      examples: phraseData.examples,
      quiz: phraseData.quiz,
      proverb_english: proverb?.english || null,
      proverb_japanese: proverb?.japanese || null,
      level: level,
      generated_at: generatedAt
    };

    const { error } = await supabase.from('phrases').insert(record);
    if (error) console.error(`  Error ${level}:`, error.message);
    else console.log(`  ✅ ${level}: ${phraseData.phrase}`);
  }
}

main().catch(console.error);
