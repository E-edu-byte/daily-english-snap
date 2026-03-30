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
 * プロンプトを生成（既存フレーズを含む）
 */
function buildPrompt(existingPhrases) {
  let prompt = `あなたは英語学習コンテンツの専門家です。日常生活で即座にレスポンスできる、実用的で役立つ英語フレーズを1つ厳選してください。

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
  }
}

重要な条件：
- フレーズは日常会話で実際によく使われるものを選ぶ
- ビジネス、カジュアル、友人同士など、様々なシーンを網羅する
- 中学生レベルから大人まで幅広く役立つ内容
- クイズは学習を深める良問にする（難しすぎず、簡単すぎず）
- 例文は必ずA/B形式の会話にし、Bの発言の前に改行コード（\\n）を入れてください
- blankWordはフレーズ内のキーとなる単語を1つ選ぶ（例: "Sounds good" なら "good"、"I'm on it" なら "on"）
- 必ず有効なJSONのみを出力し、説明文などは含めない`;

  // 既存フレーズがある場合、重複回避の指示を追加
  if (existingPhrases.length > 0) {
    prompt += `\n\n【重要】以下のフレーズは既に使用済みなので、これらとは異なる新しいフレーズを選んでください：\n`;
    prompt += existingPhrases.map(p => `- ${p}`).join('\n');
  }

  return prompt;
}

/**
 * Gemini APIでフレーズを生成
 */
async function generatePhrase(existingPhrases = []) {
  console.log('🤖 Generating phrase with Gemini API...');

  if (existingPhrases.length > 0) {
    console.log(`📚 Avoiding ${existingPhrases.length} existing phrases...`);
  }

  try {
    const prompt = buildPrompt(existingPhrases);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSONパース（マークダウンコードブロックを除去）
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const phraseData = JSON.parse(jsonText);

    // デバッグ: 生成されたデータを表示
    console.log('📋 Generated data:', JSON.stringify(phraseData, null, 2));

    // データ検証
    if (!phraseData.phrase || !phraseData.meaning || !phraseData.nuance ||
        !phraseData.examples || !phraseData.quiz || !phraseData.blankWord) {
      throw new Error('Generated data is missing required fields');
    }

    if (!Array.isArray(phraseData.examples)) {
      throw new Error(`Examples must be an array, got: ${typeof phraseData.examples}`);
    }

    if (phraseData.examples.length !== 2) {
      console.warn(`⚠️  Expected 2 examples, got ${phraseData.examples.length}. Adjusting...`);
      // 例文が2つでない場合、調整する
      if (phraseData.examples.length > 2) {
        phraseData.examples = phraseData.examples.slice(0, 2);
      } else if (phraseData.examples.length === 1) {
        phraseData.examples.push(phraseData.examples[0]); // 1つしかない場合は複製
      } else {
        throw new Error('No examples provided');
      }
    }

    if (!phraseData.quiz.question || !Array.isArray(phraseData.quiz.options) ||
        phraseData.quiz.options.length !== 3 || typeof phraseData.quiz.correct !== 'number') {
      throw new Error('Quiz data is invalid');
    }

    console.log('✅ Phrase generated successfully');
    console.log(`📝 Phrase: ${phraseData.phrase}`);

    return phraseData;
  } catch (error) {
    console.error('❌ Error generating phrase:', error.message);
    throw error;
  }
}

/**
 * Supabaseにフレーズを保存
 */
async function savePhrase(phraseData) {
  console.log('💾 Saving phrase to Supabase...');

  try {
    const { data, error } = await supabase
      .from('phrases')
      .insert({
        phrase: phraseData.phrase,
        meaning: phraseData.meaning,
        blank_word: phraseData.blankWord,
        nuance: phraseData.nuance,
        examples: phraseData.examples,
        quiz: phraseData.quiz,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Phrase saved successfully');
    console.log(`🆔 ID: ${data.id}`);

    return data;
  } catch (error) {
    console.error('❌ Error saving phrase:', error.message);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Daily English Snap - Phrase Generation Started');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('---');

  try {
    // 既存フレーズを取得（重複回避用）
    const existingPhrases = await getExistingPhrases();

    // フレーズ生成
    const phraseData = await generatePhrase(existingPhrases);

    // Supabaseに保存
    await savePhrase(phraseData);

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
