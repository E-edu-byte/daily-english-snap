#!/usr/bin/env node

/**
 * Daily English Snap - フレーズ生成スクリプト（3レベル対応版）
 *
 * Gemini APIで3つのレベル（高校英語・ビジネス英語・上級）の英語フレーズを生成し、
 * Supabaseに保存します。API呼び出しは1回のみ。
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// レベル定義
const LEVELS = ['high_school', 'business', 'advanced'];

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
      .limit(300); // 直近300件を取得（3レベル×100日分）

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
  // 以前の固定リストにあった格言（これらも避ける）
  const legacyProverbs = [
    "Actions speak louder than words.",
    "The early bird catches the worm.",
    "Practice makes perfect.",
    "Where there's a will, there's a way.",
    "Time is money.",
    "Knowledge is power.",
    "Better late than never.",
    "Two heads are better than one.",
    "When in Rome, do as the Romans do.",
    "A picture is worth a thousand words.",
    "Rome wasn't built in a day.",
    "Every cloud has a silver lining.",
    "Don't count your chickens before they hatch.",
    "The pen is mightier than the sword.",
    "You can't judge a book by its cover.",
    "All that glitters is not gold.",
    "Honesty is the best policy.",
    "A rolling stone gathers no moss.",
    "Birds of a feather flock together.",
    "Don't put all your eggs in one basket.",
    "The grass is always greener on the other side.",
    "Strike while the iron is hot.",
    "No pain, no gain.",
    "Absence makes the heart grow fonder.",
    "A friend in need is a friend indeed.",
    "An apple a day keeps the doctor away.",
    "Beggars can't be choosers.",
    "Blood is thicker than water.",
    "Curiosity killed the cat.",
    "Every dog has its day.",
  ];

  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('proverb_english')
      .not('proverb_english', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100); // 直近100件を取得

    if (error) {
      console.warn('⚠️  Could not fetch existing proverbs:', error.message);
      return legacyProverbs; // エラー時も固定リストは避ける
    }

    const dbProverbs = data.map(item => item.proverb_english).filter(Boolean);
    // 固定リスト + DB の格言を結合（重複排除）
    return [...new Set([...legacyProverbs, ...dbProverbs])];
  } catch (error) {
    console.warn('⚠️  Error fetching existing proverbs:', error.message);
    return legacyProverbs;
  }
}

/**
 * 3レベル同時生成するプロンプト（1回のAPI呼び出しで3フレーズ + 1格言生成）
 */
function buildCombinedPrompt(existingPhrases, existingProverbs) {
  let prompt = `あなたは英語学習コンテンツの専門家です。以下を生成してください：

1. 3つのレベル別英語フレーズ：
   - high_school（高校英語レベル）: 英検準2-2級 / TOEIC 500-600相当
   - business（ビジネスレベル）: 英検準1級 / TOEIC 600-800相当
   - advanced（上級レベル）: 英検1級 / TOEIC 800+相当

2. 英語の格言・ことわざ（全レベル共通）

以下のJSON形式で出力してください（JSON以外のテキストは含めないでください）：

{
  "phrases": {
    "high_school": {
      "phrase": "英語フレーズ（高校生でも理解できる基本的な表現）",
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
    },
    "business": {
      "phrase": "英語フレーズ（ビジネスシーンで使われる実用的な表現）",
      "meaning": "日本語訳",
      "blankWord": "フレーズの中で穴埋めクイズにする単語（1語）",
      "nuance": "ニュアンスの解説（ビジネスでの使い方、フォーマル度など。100文字程度）",
      "examples": [...],
      "quiz": {...}
    },
    "advanced": {
      "phrase": "英語フレーズ（上級者向けのイディオムや洗練された表現）",
      "meaning": "日本語訳",
      "blankWord": "フレーズの中で穴埋めクイズにする単語（1語）",
      "nuance": "ニュアンスの解説（ネイティブが使う高度な表現など。100文字程度）",
      "examples": [...],
      "quiz": {...}
    }
  },
  "proverb": {
    "english": "英語の格言・ことわざ",
    "japanese": "日本語訳（意訳OK、日本のことわざに置き換えてもOK）"
  }
}

重要な条件：
【レベル別フレーズについて】
- high_school: 基本的な日常表現、教科書に出てくるような実用フレーズ
- business: 会議、メール、交渉などビジネスシーンで役立つ表現
- advanced: イディオム、スラング、ネイティブが好む洗練された表現

【共通の条件】
- フレーズは日常会話で実際によく使われるものを選ぶ
- 3つのレベルで異なるフレーズを選ぶ（同じフレーズは使わない）
- クイズは学習を深める良問にする（難しすぎず、簡単すぎず）
- 例文は必ずA/B形式の会話にし、Bの発言の前に改行コード（\\n）を入れてください
- blankWordはフレーズ内のキーとなる単語を1つ選ぶ

【格言について】
- 有名で教養として知っておきたい格言を選ぶ
- 人生の知恵、努力、友情、時間など様々なテーマを網羅する
- 英語学習者にとって学びがある表現を含む

- 必ず有効なJSONのみを出力し、説明文などは含めない`;

  // 既存フレーズがある場合、重複回避の指示を追加
  if (existingPhrases.length > 0) {
    prompt += `\n\n【重要】以下のフレーズは既に使用済みなので、これらとは異なる新しいフレーズを選んでください：\n`;
    prompt += existingPhrases.slice(0, 100).map(p => `- ${p}`).join('\n'); // 最新100件のみ
  }

  // 既存格言がある場合、重複回避の指示を追加
  if (existingProverbs.length > 0) {
    prompt += `\n\n【重要】以下の格言は既に使用済みなので、これらとは異なる新しい格言を選んでください：\n`;
    prompt += existingProverbs.map(p => `- ${p}`).join('\n');
  }

  return prompt;
}

/**
 * Gemini APIで3レベルのフレーズと格言を同時生成（1回のAPI呼び出し）
 */
async function generateContent(existingPhrases = [], existingProverbs = []) {
  console.log('🤖 Generating 3-level phrases & proverb with Gemini API (1 call)...');

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

    // 3レベルのフレーズデータ検証
    for (const level of LEVELS) {
      const phraseData = data.phrases?.[level];
      if (!phraseData) {
        throw new Error(`Missing phrase data for level: ${level}`);
      }
      if (!phraseData.phrase || !phraseData.meaning || !phraseData.nuance ||
          !phraseData.examples || !phraseData.quiz || !phraseData.blankWord) {
        throw new Error(`Generated data is missing required phrase fields for level: ${level}`);
      }

      if (!Array.isArray(phraseData.examples)) {
        throw new Error(`Examples must be an array for level: ${level}, got: ${typeof phraseData.examples}`);
      }

      if (phraseData.examples.length !== 2) {
        console.warn(`⚠️  Expected 2 examples for ${level}, got ${phraseData.examples.length}. Adjusting...`);
        if (phraseData.examples.length > 2) {
          phraseData.examples = phraseData.examples.slice(0, 2);
        } else if (phraseData.examples.length === 1) {
          phraseData.examples.push(phraseData.examples[0]);
        } else {
          throw new Error(`No examples provided for level: ${level}`);
        }
      }

      if (!phraseData.quiz.question || !Array.isArray(phraseData.quiz.options) ||
          phraseData.quiz.options.length !== 3 || typeof phraseData.quiz.correct !== 'number') {
        throw new Error(`Quiz data is invalid for level: ${level}`);
      }
    }

    // 格言データ検証
    if (!data.proverb || !data.proverb.english || !data.proverb.japanese) {
      throw new Error('Generated data is missing required proverb fields');
    }

    console.log('✅ Content generated successfully');
    for (const level of LEVELS) {
      console.log(`📝 [${level}] ${data.phrases[level].phrase}`);
    }
    console.log(`📝 Proverb: ${data.proverb.english}`);

    return data;
  } catch (error) {
    console.error('❌ Error generating content:', error.message);
    throw error;
  }
}

/**
 * 今日の日付を取得（JST、YYYY-MM-DD形式）
 */
function getTodayDateJST() {
  const now = new Date();
  // JSTはUTC+9
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split('T')[0];
}

/**
 * 今日のデータが既に存在するかチェック（レベル別）
 */
async function getTodayEntries() {
  const today = getTodayDateJST();
  // JSTの今日0:00〜23:59をUTCに変換
  const startOfDayJST = `${today}T00:00:00+09:00`;
  const endOfDayJST = `${today}T23:59:59+09:00`;

  const startUTC = new Date(startOfDayJST).toISOString();
  const endUTC = new Date(endOfDayJST).toISOString();

  const { data, error } = await supabase
    .from('phrases')
    .select('id, level')
    .gte('generated_at', startUTC)
    .lte('generated_at', endUTC);

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.warn('⚠️  Error checking today entries:', error.message);
  }

  // レベルごとにマッピング
  const entries = {};
  if (data) {
    for (const item of data) {
      entries[item.level || 'high_school'] = item.id;
    }
  }

  return entries;
}

/**
 * Supabaseに3レベルのフレーズと格言を保存（1日3データ：同日なら上書き）
 */
async function saveContent(data) {
  console.log('💾 Saving 3-level phrases and proverb to Supabase...');

  try {
    // 今日のデータが既にあるかチェック
    const existingEntries = await getTodayEntries();
    const generatedAt = new Date().toISOString();

    for (const level of LEVELS) {
      const phraseData = data.phrases[level];

      const contentData = {
        phrase: phraseData.phrase,
        meaning: phraseData.meaning,
        blank_word: phraseData.blankWord,
        nuance: phraseData.nuance,
        examples: phraseData.examples,
        quiz: phraseData.quiz,
        proverb_english: data.proverb.english,
        proverb_japanese: data.proverb.japanese,
        level: level,
        generated_at: generatedAt
      };

      let savedData;
      let error;

      if (existingEntries[level]) {
        // 既存データがあれば更新
        console.log(`📝 Updating existing entry for [${level}] (ID: ${existingEntries[level]})...`);
        const result = await supabase
          .from('phrases')
          .update(contentData)
          .eq('id', existingEntries[level])
          .select()
          .single();
        savedData = result.data;
        error = result.error;
      } else {
        // なければ新規作成
        console.log(`📝 Creating new entry for [${level}]...`);
        const result = await supabase
          .from('phrases')
          .insert(contentData)
          .select()
          .single();
        savedData = result.data;
        error = result.error;
      }

      if (error) {
        throw error;
      }

      console.log(`✅ [${level}] saved successfully - ID: ${savedData.id}`);
    }

    console.log('✅ All phrases and proverb saved successfully');
  } catch (error) {
    console.error('❌ Error saving content:', error.message);
    throw error;
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Daily English Snap - 3-Level Phrase & Proverb Generation Started');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('---');

  try {
    // 既存フレーズと格言を取得（重複回避用）
    const existingPhrases = await getExistingPhrases();
    const existingProverbs = await getExistingProverbs();

    // 3レベルのフレーズと格言を同時生成（1回のAPI呼び出し）
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
