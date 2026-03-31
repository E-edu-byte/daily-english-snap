#!/usr/bin/env node

/**
 * Daily English Snap - フレーズ生成スクリプト
 *
 * Gemini APIで英語フレーズを生成し、Supabaseに保存します。
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// 環境変数の検証
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Error: ${envVar} is not set`);
    process.exit(1);
  }
}

// Gemini API の初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Supabase の初期化
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 既存のフレーズを取得（重複チェック用）
 */
async function getExistingPhrases() {
  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('phrase')
      .order('created_at', { ascending: false })
      .limit(100); // 直近100件を取得

    if (error) {
      console.warn('⚠️  Could not fetch existing phrases:', error.message);
      return [];
    }

    return data.map(item => item.phrase);
  } catch (error) {
    console.warn('⚠️  Error fetching existing phrases:', error.message);
    return [];
  }
}

/**
 * 既存の格言を取得（重複チェック用）
 */
async function getExistingProverbs() {
  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('proverb_english')
      .not('proverb_english', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100); // 直近100件を取得

    if (error) {
      console.warn('⚠️  Could not fetch existing proverbs:', error.message);
      return [];
    }

    return data.map(item => item.proverb_english).filter(Boolean);
  } catch (error) {
    console.warn('⚠️  Error fetching existing proverbs:', error.message);
    return [];
  }
}

/**
 * フレーズ＋格言を同時生成するプロンプト（1回のAPI呼び出しで両方生成）
 */
function buildCombinedPrompt(existingPhrases, existingProverbs) {
  let prompt = `あなたは英語学習コンテンツの専門家です。以下の2つを生成してください：
1. 日常生活で使える実用的な英語フレーズ
2. 英語の格言・ことわざ

以下のJSON形式で出力してください（JSON以外のテキストは含めないでください）：

{
  "phrase": "英語フレーズ（簡潔で覚えやすいもの）",
  "meaning": "日本語訳",
  "blankWord": "フレーズの中で穴埋めクイズにする単語（1語）",
  "nuance": "ニュアンスの解説（使う場面、相手との関係性、カジュアル度など。100文字程度）",
  "examples": [
    {
      "english": "A: 例文1のA発言\\nB: フレーズを使った返答",
      "japanese": "A: 日本語訳A\\nB: 日本語訳B"
    },
    {
      "english": "A: 例文2のA発言\\nB: フレーズを使った返答",
      "japanese": "A: 日本語訳A\\nB: 日本語訳B"
    }
  ],
  "quiz": {
    "question": "フレーズに関連した3択クイズの問題文",
    "options": ["選択肢1", "選択肢2", "選択肢3"],
    "correct": 0,
    "explanation": "正解の解説（なぜその答えが正しいのか）"
  },
  "proverb": {
    "english": "英語の格言・ことわざ",
    "japanese": "日本語訳（意訳OK、日本のことわざに置き換えてもOK）"
  }
}

重要な条件：
【フレーズについて】
- フレーズは日常会話で実際によく使われるものを選ぶ
- ビジネス、カジュアル、友人同士など、様々なシーンを網羅する
- 中学生レベルから大人まで幅広く役立つ内容
- クイズは学習を深める良問にする（難しすぎず、簡単すぎず）
- 例文は必ずA/B形式の会話にし、Bの発言の前に改行コード（\\n）を入れてください
- blankWordはフレーズ内のキーとなる単語を1つ選ぶ（例: "Sounds good" なら "good"、"I'm on it" なら "on"）

【格言について】
- 有名で教養として知っておきたい格言を選ぶ
- 人生の知恵、努力、友情、時間など様々なテーマを網羅する
- 英語学習者にとって学びがある表現を含む

- 必ず有効なJSONのみを出力し、説明文などは含めない`;

  // 既存フレーズがある場合、重複回避の指示を追加
  if (existingPhrases.length > 0) {
    prompt += `\n\n【重要】以下のフレーズは既に使用済みなので、これらとは異なる新しいフレーズを選んでください：\n`;
    prompt += existingPhrases.map(p => `- ${p}`).join('\n');
  }

  // 既存格言がある場合、重複回避の指示を追加
  if (existingProverbs.length > 0) {
    prompt += `\n\n【重要】以下の格言は既に使用済みなので、これらとは異なる新しい格言を選んでください：\n`;
    prompt += existingProverbs.map(p => `- ${p}`).join('\n');
  }

  return prompt;
}

/**
 * Gemini APIでフレーズと格言を同時生成（1回のAPI呼び出し）
 */
async function generateContent(existingPhrases = [], existingProverbs = []) {
  console.log('🤖 Generating phrase & proverb with Gemini API (1 call)...');

  if (existingPhrases.length > 0) {
    console.log(`📚 Avoiding ${existingPhrases.length} existing phrases...`);
  }
  if (existingProverbs.length > 0) {
    console.log(`📚 Avoiding ${existingProverbs.length} existing proverbs...`);
  }

  try {
    const prompt = buildCombinedPrompt(existingPhrases, existingProverbs);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSONパース（マークダウンコードブロックを除去）
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(jsonText);

    // デバッグ: 生成されたデータを表示
    console.log('📋 Generated data:', JSON.stringify(data, null, 2));

    // フレーズデータ検証
    if (!data.phrase || !data.meaning || !data.nuance ||
        !data.examples || !data.quiz || !data.blankWord) {
      throw new Error('Generated data is missing required phrase fields');
    }

    if (!Array.isArray(data.examples)) {
      throw new Error(`Examples must be an array, got: ${typeof data.examples}`);
    }

    if (data.examples.length !== 2) {
      console.warn(`⚠️  Expected 2 examples, got ${data.examples.length}. Adjusting...`);
      if (data.examples.length > 2) {
        data.examples = data.examples.slice(0, 2);
      } else if (data.examples.length === 1) {
        data.examples.push(data.examples[0]);
      } else {
        throw new Error('No examples provided');
      }
    }

    if (!data.quiz.question || !Array.isArray(data.quiz.options) ||
        data.quiz.options.length !== 3 || typeof data.quiz.correct !== 'number') {
      throw new Error('Quiz data is invalid');
    }

    // 格言データ検証
    if (!data.proverb || !data.proverb.english || !data.proverb.japanese) {
      throw new Error('Generated data is missing required proverb fields');
    }

    console.log('✅ Content generated successfully');
    console.log(`📝 Phrase: ${data.phrase}`);
    console.log(`📝 Proverb: ${data.proverb.english}`);

    return data;
  } catch (error) {
    console.error('❌ Error generating content:', error.message);
    throw error;
  }
}

/**
 * Supabaseにフレーズと格言を保存
 */
async function saveContent(data) {
  console.log('💾 Saving phrase and proverb to Supabase...');

  try {
    const { data: savedData, error } = await supabase
      .from('phrases')
      .insert({
        phrase: data.phrase,
        meaning: data.meaning,
        blank_word: data.blankWord,
        nuance: data.nuance,
        examples: data.examples,
        quiz: data.quiz,
        proverb_english: data.proverb.english,
        proverb_japanese: data.proverb.japanese,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Phrase and proverb saved successfully');
    console.log(`🆔 ID: ${savedData.id}`);

    return savedData;
  } catch (error) {
    console.error('❌ Error saving content:', error.message);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Daily English Snap - Phrase & Proverb Generation Started');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('---');

  try {
    // 既存フレーズと格言を取得（重複回避用）
    const existingPhrases = await getExistingPhrases();
    const existingProverbs = await getExistingProverbs();

    // フレーズと格言を同時生成（1回のAPI呼び出し）
    const content = await generateContent(existingPhrases, existingProverbs);

    console.log('---');

    // Supabaseに保存
    await saveContent(content);

    console.log('---');
    console.log('🎉 All tasks completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('---');
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// 実行
main();
