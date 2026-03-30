'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PhraseCard from '../../components/PhraseCard'
import DailyProverbArchive from '../../components/DailyProverbArchive'
import { Lora } from 'next/font/google'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

// ことわざリスト（DailyProverb.tsxと同じ）
const proverbs = [
  { english: "Actions speak louder than words.", japanese: "行動は言葉よりも雄弁である" },
  { english: "The early bird catches the worm.", japanese: "早起きは三文の徳" },
  { english: "Practice makes perfect.", japanese: "習うより慣れよ" },
  { english: "Where there's a will, there's a way.", japanese: "意志あるところに道は開ける" },
  { english: "Time is money.", japanese: "時は金なり" },
  { english: "Knowledge is power.", japanese: "知識は力なり" },
  { english: "Better late than never.", japanese: "遅れても来ないよりまし" },
  { english: "Two heads are better than one.", japanese: "三人寄れば文殊の知恵" },
  { english: "When in Rome, do as the Romans do.", japanese: "郷に入っては郷に従え" },
  { english: "A picture is worth a thousand words.", japanese: "百聞は一見に如かず" },
  { english: "Rome wasn't built in a day.", japanese: "ローマは一日にして成らず" },
  { english: "Every cloud has a silver lining.", japanese: "どんな困難にも希望の光がある" },
  { english: "Don't count your chickens before they hatch.", japanese: "捕らぬ狸の皮算用" },
  { english: "The pen is mightier than the sword.", japanese: "ペンは剣よりも強し" },
  { english: "You can't judge a book by its cover.", japanese: "見かけで判断してはいけない" },
  { english: "All that glitters is not gold.", japanese: "光るものすべてが金とは限らない" },
  { english: "Honesty is the best policy.", japanese: "正直は最善の策" },
  { english: "A rolling stone gathers no moss.", japanese: "転石苔むさず" },
  { english: "Birds of a feather flock together.", japanese: "類は友を呼ぶ" },
  { english: "Don't put all your eggs in one basket.", japanese: "卵を一つのカゴに盛るな" },
  { english: "The grass is always greener on the other side.", japanese: "隣の芝生は青く見える" },
  { english: "Strike while the iron is hot.", japanese: "鉄は熱いうちに打て" },
  { english: "No pain, no gain.", japanese: "苦労なくして成果なし" },
  { english: "Absence makes the heart grow fonder.", japanese: "会えない時間が愛を育てる" },
  { english: "A friend in need is a friend indeed.", japanese: "困った時の友こそ真の友" },
  { english: "An apple a day keeps the doctor away.", japanese: "一日一個のりんごで医者いらず" },
  { english: "Beggars can't be choosers.", japanese: "贅沢は言えない" },
  { english: "Blood is thicker than water.", japanese: "血は水よりも濃い" },
  { english: "Curiosity killed the cat.", japanese: "好奇心は身を滅ぼす" },
  { english: "Every dog has its day.", japanese: "誰にでも全盛期がある" },
]

// フレーズリスト（page.tsxのmockPhrasesと同じ構造）
const mockPhrases = [
  {
    id: 'mock-1',
    phrase: "Sounds good.",
    blankWord: "good",
    meaning: "いいね、分かった、それでいこう",
    nuance: "相手からの提案、計画、アイデアなどに対して「良いね」「賛成」「それで大丈夫」と肯定的に返答する際に使います。カジュアルからビジネスまで幅広い場面で使えます。",
    examples: [
      { english: "A: How about we meet at 7 PM for dinner?\nB: Sounds good. I'll make a reservation.", japanese: "A: 夕食に7時でどう？\nB: いいね。予約しておくよ。" },
      { english: "A: Let's wrap up the meeting here.\nB: Sounds good to me.", japanese: "A: ここで会議を終わりにしましょう。\nB: いいですね。" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-2',
    phrase: "I'm on my way.",
    blankWord: "way",
    meaning: "今向かってるところ",
    nuance: "待ち合わせに遅れそうな時や、どこにいるか聞かれた時に使います。「もうすぐ着く」というニュアンスを含み、相手を安心させる効果があります。",
    examples: [
      { english: "A: Where are you? The movie starts in 10 minutes!\nB: I'm on my way. Be there soon!", japanese: "A: どこにいるの？映画10分で始まるよ！\nB: 今向かってる。すぐ着くよ！" },
      { english: "A: Are you coming to the party?\nB: Yes, I'm on my way now.", japanese: "A: パーティー来る？\nB: うん、今向かってるところ。" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-3',
    phrase: "Let me check.",
    blankWord: "check",
    meaning: "確認させて、ちょっと調べるね",
    nuance: "すぐに答えられない質問を受けた時や、情報を確認する必要がある時に使います。ビジネスでも日常でも非常によく使われる便利なフレーズです。",
    examples: [
      { english: "A: Is the meeting room available at 3?\nB: Let me check... Yes, it's free.", japanese: "A: 3時に会議室空いてる？\nB: 確認するね...うん、空いてるよ。" },
      { english: "A: Do you have this in size M?\nB: Let me check the back.", japanese: "A: これのMサイズありますか？\nB: 奥を確認してきますね。" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-4',
    phrase: "No worries.",
    blankWord: "worries",
    meaning: "大丈夫だよ、気にしないで",
    nuance: "相手が謝ってきた時や、感謝された時に「問題ないよ」と返す表現。「You're welcome」よりカジュアルで、現代の会話でとても人気があります。",
    examples: [
      { english: "A: Sorry I'm late!\nB: No worries. We just started.", japanese: "A: 遅れてごめん！\nB: 大丈夫だよ。今始まったところ。" },
      { english: "A: Thanks for helping me move.\nB: No worries! Happy to help.", japanese: "A: 引っ越し手伝ってくれてありがとう。\nB: 気にしないで！喜んで。" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-5',
    phrase: "I'll get back to you.",
    blankWord: "back",
    meaning: "後で連絡するね、また返事します",
    nuance: "今すぐ答えられない時や、確認後に連絡すると伝える時に使います。ビジネスメールでも口頭でも頻繁に使われるプロフェッショナルな表現です。",
    examples: [
      { english: "A: Can you give me a quote by tomorrow?\nB: I'll get back to you by end of day.", japanese: "A: 明日までに見積もりもらえる？\nB: 今日中に連絡しますね。" },
      { english: "A: What do you think about the proposal?\nB: Let me review it. I'll get back to you.", japanese: "A: この提案どう思う？\nB: 確認させて。また連絡するね。" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-6',
    phrase: "That makes sense.",
    blankWord: "sense",
    meaning: "なるほど、それは理にかなっている",
    nuance: "相手の説明や理由を聞いて納得した時に使います。「I understand」より積極的に同意・納得を示すニュアンスがあります。",
    examples: [
      { english: "A: We should launch in spring because that's when sales peak.\nB: That makes sense.", japanese: "A: 春に発売すべきだよ、売上がピークになる時期だから。\nB: なるほど、それは理にかなってるね。" },
      { english: "A: I took the train because parking is expensive downtown.\nB: Yeah, that makes sense.", japanese: "A: 駐車場代が高いから電車で来たんだ。\nB: うん、それがいいね。" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-7',
    phrase: "I'm not sure.",
    blankWord: "sure",
    meaning: "よくわからない、確信がない",
    nuance: "はっきり答えられない時や、自信がない時に使います。「I don't know」より柔らかく、謙虚な印象を与えます。",
    examples: [
      { english: "A: Is the store open on Sundays?\nB: I'm not sure. Let me Google it.", japanese: "A: その店、日曜日開いてる？\nB: わからないな。ググってみるね。" },
      { english: "A: Do you think he'll come?\nB: I'm not sure. He hasn't replied yet.", japanese: "A: 彼来ると思う？\nB: わからない。まだ返事ないし。" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-8',
    phrase: "Could you say that again?",
    blankWord: "again",
    meaning: "もう一度言ってもらえますか？",
    nuance: "聞き取れなかった時や、もう一度確認したい時に使う丁寧な表現。「What?」や「Huh?」よりずっと礼儀正しいです。",
    examples: [
      { english: "A: The meeting is at 2:30 in room B12.\nB: Sorry, could you say that again? Which room?", japanese: "A: 会議は2:30にB12室でね。\nB: ごめん、もう一度言って？どの部屋？" },
      { english: "A: My email is john.smith@company.com.\nB: Could you say that again slowly?", japanese: "A: メールアドレスはjohn.smith@company.comです。\nB: ゆっくりもう一度言ってもらえますか？" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-9',
    phrase: "It depends.",
    blankWord: "depends",
    meaning: "場合による、状況次第",
    nuance: "一概に答えられない時や、条件によって答えが変わる時に使います。この後に「on〜」をつけて具体的に説明することが多いです。",
    examples: [
      { english: "A: Is Tokyo expensive?\nB: It depends. Eating out can be cheap or very expensive.", japanese: "A: 東京って高い？\nB: 場合によるね。外食は安くも高くもなるよ。" },
      { english: "A: How long does it take to learn English?\nB: It depends on how much you practice.", japanese: "A: 英語習得にどれくらいかかる？\nB: どれだけ練習するかによるね。" }
    ],
    generated_at: ""
  },
  {
    id: 'mock-10',
    phrase: "I'll figure it out.",
    blankWord: "figure",
    meaning: "なんとかするよ、自分で解決する",
    nuance: "問題に直面した時に「心配しないで、対処するよ」と伝える表現。自立した印象を与え、ポジティブなニュアンスがあります。",
    examples: [
      { english: "A: The instructions are all in Japanese!\nB: Don't worry, I'll figure it out.", japanese: "A: 説明書が全部日本語だ！\nB: 心配しないで、なんとかするよ。" },
      { english: "A: How will you get to the airport?\nB: I'll figure it out. Maybe take a taxi.", japanese: "A: 空港までどうやって行くの？\nB: なんとかするよ。タクシーかな。" }
    ],
    generated_at: ""
  },
]

// 日付からフレーズを取得
function getPhraseForDate(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = (dayOfYear + 1) % mockPhrases.length
  const phrase = { ...mockPhrases[index] }
  phrase.generated_at = date.toISOString()
  return phrase
}

// 日付からことわざを取得
function getProverbForDate(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = (dayOfYear + 1) % proverbs.length
  return proverbs[index]
}

export default function ArchivePage() {
  const params = useParams()
  const dateStr = params.date as string

  // 日付をパース (YYYY-MM-DD形式)
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  const phrase = getPhraseForDate(date)
  const proverb = getProverbForDate(date)

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 戻るボタン */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">トップに戻る</span>
      </Link>

      {/* 日付ヘッダー */}
      <div className="text-center mb-8">
        <p className="text-stone-500 text-sm mb-2">アーカイブ</p>
        <h1 className={`text-3xl font-bold text-stone-800 ${lora.className}`}>
          {formatDate(date)}
        </h1>
      </div>

      {/* ことわざ */}
      <DailyProverbArchive proverb={proverb} />

      {/* フレーズ */}
      <h2 className={`text-4xl font-bold text-emerald-600 font-serif mb-6 text-center ${lora.className}`}>
        Today's quiz
      </h2>
      <PhraseCard phrase={phrase} date={dateStr} />
    </div>
  )
}
