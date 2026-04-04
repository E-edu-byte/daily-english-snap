#!/usr/bin/env node

/**
 * 過去の日付に対してビジネス・上級レベルのフレーズを生成するスクリプト
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 生成する日付（JST）
const dates = ['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04'];

async function getExistingPhrases() {
  const { data } = await supabase.from('phrases').select('phrase').limit(100);
  return data ? data.map(d => d.phrase) : [];
}

async function getProverbForDate(dateStr) {
  const startOfDay = `${dateStr}T00:00:00+09:00`;
  const endOfDay = `${dateStr}T23:59:59+09:00`;

  const { data } = await supabase
    .from('phrases')
    .select('proverb_english, proverb_japanese')
    .gte('generated_at', startOfDay)
    .lte('generated_at', endOfDay)
    .limit(1)
    .single();

  return data ? { english: data.proverb_english, japanese: data.proverb_japanese } : null;
}

function buildPrompt(existingPhrases) {
  return `あなたは英語学習コンテンツの専門家です。以下の2つのレベル用フレーズを生成してください：

1. business（ビジネスレベル）: 英検準1級 / TOEIC 600-800相当
2. advanced（上級レベル）: 英検1級 / TOEIC 800+相当

JSON形式で出力してください：
{
  "business": {
    "phrase": "ビジネスシーンで使われる実用的な表現",
    "meaning": "日本語訳",
    "blankWord": "穴埋めクイズにする単語（1語）",
    "nuance": "ビジネスでの使い方（100文字程度）",
    "examples": [
      { "english": "A: 例文1\\nB: 返答", "japanese": "A: 訳\\nB: 訳" },
      { "english": "A: 例文2\\nB: 返答", "japanese": "A: 訳\\nB: 訳" }
    ],
    "quiz": { "question": "問題文", "options": ["選択肢1", "選択肢2", "選択肢3"], "correct": 0, "explanation": "解説" }
  },
  "advanced": {
    "phrase": "上級者向けのイディオムや洗練された表現",
    "meaning": "日本語訳",
    "blankWord": "穴埋めクイズにする単語（1語）",
    "nuance": "ネイティブが使う高度な表現（100文字程度）",
    "examples": [
      { "english": "A: 例文1\\nB: 返答", "japanese": "A: 訳\\nB: 訳" },
      { "english": "A: 例文2\\nB: 返答", "japanese": "A: 訳\\nB: 訳" }
    ],
    "quiz": { "question": "問題文", "options": ["選択肢1", "選択肢2", "選択肢3"], "correct": 0, "explanation": "解説" }
  }
}

【重要】以下のフレーズは既に使用済みなので避けてください：
${existingPhrases.slice(0, 50).join(', ')}

JSONのみ出力し、説明文は含めないでください。`;
}

async function generateForDate(dateStr, existingPhrases) {
  console.log(`\n📅 Generating for ${dateStr}`);

  const proverb = await getProverbForDate(dateStr);
  console.log(`  Proverb: ${proverb?.english || 'None'}`);

  const prompt = buildPrompt(existingPhrases);
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const data = JSON.parse(text);

  // JSTの12:00をUTCに変換
  const generatedAt = new Date(`${dateStr}T03:00:00Z`).toISOString();

  const newPhrases = [];

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

    const { data: saved, error } = await supabase.from('phrases').insert(record).select().single();
    if (error) {
      console.error(`  Error saving ${level}:`, error.message);
    } else {
      console.log(`  ✅ ${level}: ${phraseData.phrase}`);
      newPhrases.push(phraseData.phrase);
    }
  }

  return newPhrases;
}

async function main() {
  console.log('🚀 Generating business & advanced for Apr 1-4');
  let existingPhrases = await getExistingPhrases();

  for (const dateStr of dates) {
    try {
      const newPhrases = await generateForDate(dateStr, existingPhrases);
      existingPhrases = [...existingPhrases, ...newPhrases];
      // 1秒待機
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`Error for ${dateStr}:`, error.message);
    }
  }

  console.log('\n🎉 Done!');
}

main();
