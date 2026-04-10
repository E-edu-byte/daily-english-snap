#!/usr/bin/env node

/**
 * Daily English Snap - X(Twitter)投稿生成スクリプト
 *
 * Supabaseから指定日・レベルのフレーズを取得し、
 * エンゲージメントを高めるX投稿用テキストを生成します。
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// レベル表示名
const LEVEL_NAMES = {
  high_school: '高校英語',
  business: 'ビジネス',
  advanced: '上級'
};

// レベル別のハッシュタグ
const LEVEL_HASHTAGS = {
  high_school: '#英検 #高校英語',
  business: '#ビジネス英語 #TOEIC',
  advanced: '#英検1級 #ネイティブ英語'
};

// 環境変数の検証
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

// Supabase の初期化
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * フレーズを穴埋め形式に変換（単語の文字数分の_）
 */
function createBlankPhrase(phrase, blankWord) {
  // 大文字小文字を無視して置換
  const regex = new RegExp(blankWord, 'gi');
  const blank = '_'.repeat(blankWord.length);
  return phrase.replace(regex, blank);
}

/**
 * X投稿テキストを生成
 */
function generateXPost(phraseData, date, level) {
  const levelName = LEVEL_NAMES[level] || level;
  const levelHashtags = LEVEL_HASHTAGS[level] || '';

  // 穴埋め形式のフレーズ
  const blankPhrase = createBlankPhrase(phraseData.phrase, phraseData.blank_word);

  // URL生成
  const url = `https://english.news-navi.jp/?d=${date}&level=${level}`;

  // 投稿テキスト
  const post = `【今日の英語クイズ - ${levelName}】

「${blankPhrase}」
（${phraseData.meaning}）

空欄に入る単語は？
→ ${url}

わかったら♡

#英語学習 #英会話 #1日1分英語 ${levelHashtags}`;

  return post;
}

/**
 * 格言付きの投稿テキストを生成（1日1回用）
 */
function generateXPostWithProverb(phraseData, date, level) {
  const levelName = LEVEL_NAMES[level] || level;
  const levelHashtags = LEVEL_HASHTAGS[level] || '';

  const blankPhrase = createBlankPhrase(phraseData.phrase, phraseData.blank_word);
  const url = `https://english.news-navi.jp/?d=${date}&level=${level}`;

  const post = `【今日の英語クイズ - ${levelName}】

「${blankPhrase}」
（${phraseData.meaning}）

空欄に入る単語は？
→ ${url}

わかったら♡

---
${phraseData.proverb_english}
「${phraseData.proverb_japanese}」

#英語学習 #英会話 #1日1分英語 ${levelHashtags}`;

  return post;
}

/**
 * 指定日・レベルのフレーズを取得
 */
async function getPhrase(date, level) {
  // JSTの日付範囲を計算
  const startOfDayJST = `${date}T00:00:00+09:00`;
  const endOfDayJST = `${date}T23:59:59+09:00`;
  const startUTC = new Date(startOfDayJST).toISOString();
  const endUTC = new Date(endOfDayJST).toISOString();

  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .eq('level', level)
    .gte('generated_at', startUTC)
    .lte('generated_at', endUTC)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // データなし
    }
    throw error;
  }

  return data;
}

/**
 * 今日の日付を取得（JST）
 */
function getTodayDateJST() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split('T')[0];
}

/**
 * メイン処理
 */
async function main() {
  // コマンドライン引数を解析
  const args = process.argv.slice(2);
  let date = getTodayDateJST();
  let level = 'high_school';
  let includeProverb = false;
  let showAll = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' || args[i] === '-d') {
      date = args[i + 1];
      i++;
    } else if (args[i] === '--level' || args[i] === '-l') {
      level = args[i + 1];
      i++;
    } else if (args[i] === '--proverb' || args[i] === '-p') {
      includeProverb = true;
    } else if (args[i] === '--all' || args[i] === '-a') {
      showAll = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Daily English Snap - X投稿生成スクリプト

Usage: node generate-x-post.mjs [options]

Options:
  -d, --date <YYYY-MM-DD>  日付を指定（デフォルト: 今日）
  -l, --level <level>      レベルを指定: high_school, business, advanced
  -p, --proverb            格言を含める
  -a, --all                全レベルの投稿を生成
  -h, --help               ヘルプを表示

Examples:
  node generate-x-post.mjs                           # 今日の初級
  node generate-x-post.mjs -l business               # 今日の中級
  node generate-x-post.mjs -d 2026-04-10 -l advanced # 特定日の上級
  node generate-x-post.mjs -a                        # 今日の全レベル
  node generate-x-post.mjs -l high_school -p         # 格言付き
`);
      process.exit(0);
    }
  }

  console.log(`📅 Date: ${date}`);
  console.log('---\n');

  if (showAll) {
    // 全レベルの投稿を生成
    const levels = ['high_school', 'business', 'advanced'];
    for (const lvl of levels) {
      const phraseData = await getPhrase(date, lvl);
      if (!phraseData) {
        console.log(`⚠️  [${LEVEL_NAMES[lvl]}] データがありません\n`);
        continue;
      }

      console.log(`=== ${LEVEL_NAMES[lvl]} ===\n`);
      const post = generateXPost(phraseData, date, lvl);
      console.log(post);
      console.log(`\n文字数: ${post.length}/280`);
      console.log('\n---\n');
    }
  } else {
    // 単一レベルの投稿を生成
    const phraseData = await getPhrase(date, level);

    if (!phraseData) {
      console.error(`❌ ${date} の ${level} データが見つかりません`);
      process.exit(1);
    }

    const post = includeProverb
      ? generateXPostWithProverb(phraseData, date, level)
      : generateXPost(phraseData, date, level);

    console.log(post);
    console.log(`\n---\n文字数: ${post.length}/280`);

    if (post.length > 280) {
      console.warn('⚠️  280文字を超えています！短縮が必要です。');
    }
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
