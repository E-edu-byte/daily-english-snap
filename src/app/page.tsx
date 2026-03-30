import { createClient } from '@supabase/supabase-js'
import { Lightbulb } from 'lucide-react'
import PhraseCard from './components/PhraseCard'
import DailyProverb from './components/DailyProverb'
import PastArchive from './components/PastArchive'
import { Lora } from 'next/font/google'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

// Supabase クライアント（サーバーサイド）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export const revalidate = 300 // 5分ごとに再検証

// ローカル開発用モックデータ（英語中級レベル・実用フレーズ）
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
    quiz: { question: "友人から「7時に駅で待ち合わせでどう？」と言われたとき、Sounds good.と答えると？", options: ["了解、それでいこう", "音がいいね", "良さそうに聞こえる"], correct: 0, explanation: "「Sounds good.」は提案への同意を表し、「いいね、そうしよう」という意味です。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "「I'm on my way.」を使うのに最も適切な場面は？", options: ["待ち合わせに向かっているとき", "道に迷っているとき", "帰宅したとき"], correct: 0, explanation: "「I'm on my way.」は目的地に向かっている最中に使います。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "「Let me check.」の後に続く行動として自然なのは？", options: ["スケジュールを調べる", "すぐに断る", "話題を変える"], correct: 0, explanation: "「Let me check.」は確認が必要なときに使い、その後で情報を調べます。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "友人が「遅れてごめん！」と謝ったとき、No worries.と返すとどんな印象？", options: ["全然気にしてないよ、と優しく返す", "ちょっと怒っている", "話を聞いていない"], correct: 0, explanation: "「No worries.」は相手を安心させる温かい返答です。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "上司に質問されてすぐに答えられないとき、I'll get back to you.と言うと？", options: ["確認して後で連絡します", "あなたのところに戻ります", "仕返しします"], correct: 0, explanation: "「get back to」は「連絡を返す」という意味のビジネス頻出表現です。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "「That makes sense.」は相手のどんな発言に対して使う？", options: ["論理的で納得できる説明", "面白い冗談", "悲しいニュース"], correct: 0, explanation: "「That makes sense.」は相手の説明に「なるほど」と納得したときに使います。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "「I'm not sure.」と「I don't know.」の違いは？", options: ["I'm not sure.の方が柔らかく謙虚", "I'm not sure.の方が強い否定", "意味は全く同じ"], correct: 0, explanation: "「I'm not sure.」は「確信がない」というニュアンスで、より柔らかい印象を与えます。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "ビジネスの電話で相手の言葉が聞き取れなかったとき、最も適切な対応は？", options: ["Could you say that again?と丁寧に聞く", "What?と短く聞く", "聞こえたふりをする"], correct: 0, explanation: "「Could you say that again?」はビジネスでも使える丁寧な聞き返し表現です。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "「東京って物価高い？」と聞かれて「It depends.」と答える意図は？", options: ["一概には言えない、条件による", "完全に高い", "全然高くない"], correct: 0, explanation: "「It depends.」は状況や条件によって答えが変わることを伝えます。" },
    generated_at: new Date().toISOString()
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
    quiz: { question: "「I'll figure it out.」を言う人はどんな姿勢を見せている？", options: ["自分で解決しようとする前向きな姿勢", "諦めている", "他人任せにしている"], correct: 0, explanation: "「I'll figure it out.」は問題に自力で取り組む意欲を示します。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-11',
    phrase: "I'm looking forward to it.",
    blankWord: "forward",
    meaning: "楽しみにしています",
    nuance: "予定されているイベントや約束を楽しみにしていると伝える表現。ビジネスメールの結びにもよく使われます。",
    examples: [
      { english: "A: See you at the party on Saturday!\nB: I'm looking forward to it!", japanese: "A: 土曜日のパーティーでね！\nB: 楽しみにしてる！" },
      { english: "A: I'll send you the proposal tomorrow.\nB: Great, I'm looking forward to it.", japanese: "A: 明日提案書を送りますね。\nB: ありがとう、楽しみにしています。" }
    ],
    quiz: { question: "「I'm looking forward to it.」をメールの結びに使う効果は？", options: ["期待と好意を伝える温かい印象", "催促しているプレッシャー", "興味がないという意思表示"], correct: 0, explanation: "この表現はビジネスメールでも好印象を与える結びの定番です。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-12',
    phrase: "Let's keep in touch.",
    blankWord: "touch",
    meaning: "連絡を取り合おうね",
    nuance: "別れ際や、しばらく会えなくなる時に使う表現。友人関係を続けたいという気持ちを伝えます。",
    examples: [
      { english: "A: It was great seeing you!\nB: Yeah! Let's keep in touch.", japanese: "A: 会えてよかった！\nB: うん！連絡取り合おうね。" },
      { english: "A: I'm moving to London next month.\nB: That's exciting! Let's keep in touch.", japanese: "A: 来月ロンドンに引っ越すんだ。\nB: いいね！連絡取り合おう。" }
    ],
    quiz: { question: "「Let's keep in touch.」を言うのに最も適切なタイミングは？", options: ["久しぶりに会った友人との別れ際", "毎日会う同僚への挨拶", "初対面の自己紹介"], correct: 0, explanation: "この表現はしばらく会えなくなる相手との別れ際に使います。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-13',
    phrase: "I didn't catch that.",
    blankWord: "catch",
    meaning: "聞き取れなかった",
    nuance: "相手の言葉が聞こえなかった時や、理解できなかった時に使います。「catch」は「聞き取る、理解する」という意味で使われています。",
    examples: [
      { english: "A: The password is xK9#mP2!\nB: Sorry, I didn't catch that. Can you spell it?", japanese: "A: パスワードはxK9#mP2!です。\nB: ごめん、聞き取れなかった。スペルを教えて？" },
      { english: "A: Meet me at the café on 5th Street.\nB: I didn't catch that. Which street?", japanese: "A: 5番街のカフェで会おう。\nB: 聞き取れなかった。どの通り？" }
    ],
    quiz: { question: "「I didn't catch that.」の「catch」が意味するのは？", options: ["聞き取る・理解する", "捕まえる", "追いかける"], correct: 0, explanation: "「catch」は「聞き取る・理解する」という意味でも使われる便利な単語です。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-14',
    phrase: "You're telling me!",
    blankWord: "telling",
    meaning: "本当にそうだよね！（強い同意）",
    nuance: "相手の発言に強く同意する時に使います。「まさにその通り！」「言わなくてもわかるよ！」というニュアンスです。",
    examples: [
      { english: "A: This weather is so hot!\nB: You're telling me! I can't stand it.", japanese: "A: この暑さやばいね！\nB: 本当にね！耐えられないよ。" },
      { english: "A: That exam was really difficult.\nB: You're telling me! I barely finished.", japanese: "A: あの試験本当に難しかった。\nB: まさにね！ギリギリで終わったよ。" }
    ],
    quiz: { question: "「今日めっちゃ暑いね」→「You're telling me!」この返答のニュアンスは？", options: ["本当にそう！言われなくてもわかる！", "教えてくれてありがとう", "そうかな？"], correct: 0, explanation: "「You're telling me!」は「まさに！自分も強くそう思う」という共感を示します。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-15',
    phrase: "I can't make it.",
    blankWord: "make",
    meaning: "行けない、参加できない",
    nuance: "予定に参加できないことを伝える時に使います。「make it」は「間に合う、参加する」という意味。丁寧に断る表現です。",
    examples: [
      { english: "A: Can you come to the meeting at 3?\nB: Sorry, I can't make it. I have another appointment.", japanese: "A: 3時の会議来れる？\nB: ごめん、行けないんだ。別の予定があって。" },
      { english: "A: Are you joining us for dinner?\nB: I'm afraid I can't make it tonight.", japanese: "A: 夕食一緒にどう？\nB: 残念だけど今夜は行けないんだ。" }
    ],
    quiz: { question: "「I can't make it.」の「make it」が表すのは？", options: ["参加する・間に合う", "作る", "成功する"], correct: 0, explanation: "「make it」は予定への参加や時間に間に合うことを表す重要表現です。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-16',
    phrase: "I'm running late.",
    blankWord: "running",
    meaning: "遅れています",
    nuance: "約束の時間に遅れそうな時に連絡する表現。「running」は「進行中」のニュアンスで、今まさに遅れているという状況を伝えます。",
    examples: [
      { english: "A: Where are you?\nB: Sorry, I'm running late. Be there in 10 minutes.", japanese: "A: どこにいるの？\nB: ごめん、遅れてる。10分で着くよ。" },
      { english: "A: The meeting starts at 9.\nB: I know, I'm running a bit late. Start without me.", japanese: "A: 会議9時からだよ。\nB: わかってる、ちょっと遅れてて。先に始めてて。" }
    ],
    quiz: { question: "「I'm running late.」を連絡するのに適切なタイミングは？", options: ["遅刻しそうだと気づいたとき", "すでに大幅に遅刻した後", "予定より早く着いたとき"], correct: 0, explanation: "遅れそうだと気づいた時点で早めに連絡するのがマナーです。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-17',
    phrase: "What do you mean?",
    blankWord: "mean",
    meaning: "どういう意味？",
    nuance: "相手の発言の意図や意味がわからない時に確認する表現。攻撃的にならずに、純粋に理解したいという気持ちを伝えられます。",
    examples: [
      { english: "A: We need to think outside the box.\nB: What do you mean exactly?", japanese: "A: 枠にとらわれない発想が必要だね。\nB: 具体的にはどういうこと？" },
      { english: "A: This project is 'on hold.'\nB: What do you mean? Is it cancelled?", japanese: "A: このプロジェクトは「保留」だよ。\nB: どういう意味？中止ってこと？" }
    ],
    quiz: { question: "「What do you mean?」を使うときの適切なトーンは？", options: ["純粋に理解したいという姿勢", "相手を責める攻撃的な態度", "全く興味がない様子"], correct: 0, explanation: "トーン次第で印象が変わります。穏やかに聞くのがポイントです。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-18',
    phrase: "That's a good point.",
    blankWord: "point",
    meaning: "それはいい指摘だね",
    nuance: "相手の意見や指摘に同意する時に使います。会議やディスカッションで相手を認め、建設的な会話を促す効果があります。",
    examples: [
      { english: "A: We should also consider the budget.\nB: That's a good point. Let me add that to the agenda.", japanese: "A: 予算のことも考えるべきだよね。\nB: いい指摘だね。議題に追加するよ。" },
      { english: "A: What if it rains on that day?\nB: That's a good point. We need a backup plan.", japanese: "A: その日雨だったらどうする？\nB: それはいい指摘だ。予備プランが必要だね。" }
    ],
    quiz: { question: "会議で「That's a good point.」と言う効果は？", options: ["相手の意見を認め議論を建設的にする", "話を終わらせる", "反論の準備をする"], correct: 0, explanation: "相手の発言を認めることで、良好なコミュニケーションが生まれます。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-19',
    phrase: "I'll take care of it.",
    blankWord: "care",
    meaning: "私が対応します、任せて",
    nuance: "何かを引き受ける時や、責任を持って処理すると伝える時に使います。頼れる印象を与える表現です。",
    examples: [
      { english: "A: Someone needs to book the restaurant.\nB: I'll take care of it.", japanese: "A: 誰かレストラン予約しないと。\nB: 私がやるよ。" },
      { english: "A: This report has some errors.\nB: I'll take care of it right away.", japanese: "A: このレポート、いくつかミスがあるよ。\nB: すぐに対応します。" }
    ],
    quiz: { question: "「I'll take care of it.」と言うことで相手に与える印象は？", options: ["頼りになる、任せられる", "めんどくさそう", "自信がない"], correct: 0, explanation: "この表現は責任を持って対応するという信頼感を与えます。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-20',
    phrase: "I'm sorry to hear that.",
    blankWord: "sorry",
    meaning: "それは残念ですね、お気の毒に",
    nuance: "相手から悪い知らせや困難な状況を聞いた時に使う同情の表現。心からの思いやりを示します。",
    examples: [
      { english: "A: My grandmother passed away last week.\nB: I'm so sorry to hear that.", japanese: "A: 先週祖母が亡くなったんだ。\nB: それは本当にお気の毒に。" },
      { english: "A: I didn't get the job.\nB: I'm sorry to hear that. Their loss!", japanese: "A: その仕事、不採用だった。\nB: 残念だね。向こうの損失だよ！" }
    ],
    quiz: { question: "「I'm sorry to hear that.」の「sorry」はどんな気持ち？", options: ["同情・残念に思う気持ち", "謝罪", "申し訳なさ"], correct: 0, explanation: "この「sorry」は謝罪ではなく、相手への同情を表します。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-21',
    phrase: "Would you mind...?",
    blankWord: "mind",
    meaning: "〜していただけますか？（丁寧な依頼）",
    nuance: "非常に丁寧にお願いする時の表現。「mind」は「嫌がる」という意味なので、「〜するのを嫌がりますか？」→「〜してもらえますか？」となります。",
    examples: [
      { english: "A: Would you mind opening the window?\nB: Not at all.", japanese: "A: 窓を開けていただけますか？\nB: もちろん。" },
      { english: "A: Would you mind waiting for a moment?\nB: Sure, no problem.", japanese: "A: 少々お待ちいただけますか？\nB: はい、大丈夫ですよ。" }
    ],
    quiz: { question: "「Would you mind opening the window?」に「No」と答えると？", options: ["開けてもいいですよ（嫌じゃない）", "開けたくない", "わからない"], correct: 0, explanation: "mind=嫌がる なので、Noは「嫌じゃない＝OKです」という意味になります。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-22',
    phrase: "I'm working on it.",
    blankWord: "working",
    meaning: "今取り組んでいます",
    nuance: "何かの進捗を聞かれた時に、現在進行中であることを伝える表現。焦らせる相手に対して安心感を与えます。",
    examples: [
      { english: "A: Have you finished the report?\nB: Not yet. I'm working on it.", japanese: "A: レポート終わった？\nB: まだ。今やってるところ。" },
      { english: "A: When will the website be ready?\nB: I'm working on it. Should be done by Friday.", japanese: "A: ウェブサイトいつ完成する？\nB: 今作業中です。金曜までには。" }
    ],
    quiz: { question: "「進捗どう？」と催促されたとき「I'm working on it.」と答える効果は？", options: ["取り組み中と伝えて安心させる", "完了したと報告する", "手をつけていないと認める"], correct: 0, explanation: "進行中であることを伝え、焦らせる相手を安心させる効果があります。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-23',
    phrase: "It's up to you.",
    blankWord: "up",
    meaning: "あなた次第だよ、君が決めて",
    nuance: "決定権を相手に委ねる時に使います。「どちらでもいい」というニュアンスで、相手の意見を尊重する表現です。",
    examples: [
      { english: "A: Should we eat Italian or Japanese?\nB: It's up to you. I'm fine with either.", japanese: "A: イタリアンと和食、どっちがいい？\nB: 君に任せるよ。どっちでもいいよ。" },
      { english: "A: What time should we leave?\nB: It's up to you. Whenever you're ready.", japanese: "A: 何時に出発する？\nB: 任せるよ。準備できたらいつでも。" }
    ],
    quiz: { question: "「It's up to you.」を使う場面として適切なのは？", options: ["相手に決定権を委ねるとき", "自分が決めたいとき", "強く反対するとき"], correct: 0, explanation: "この表現は相手の意見を尊重し、決定を任せるときに使います。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-24',
    phrase: "I totally agree.",
    blankWord: "totally",
    meaning: "完全に同意します",
    nuance: "相手の意見に強く賛成する時に使います。「totally」を加えることで、同意の度合いを強調しています。",
    examples: [
      { english: "A: I think we need more time for this project.\nB: I totally agree. Let's extend the deadline.", japanese: "A: このプロジェクトにはもっと時間が必要だと思う。\nB: 完全に同意。締め切りを延ばそう。" },
      { english: "A: Traveling is the best way to learn about cultures.\nB: I totally agree!", japanese: "A: 旅行は文化を学ぶ最高の方法だよね。\nB: 本当にそう思う！" }
    ],
    quiz: { question: "「I totally agree.」と「I agree.」の違いは？", options: ["totallyが入ると同意の強さが増す", "意味は全く同じ", "totallyが入ると皮肉になる"], correct: 0, explanation: "「totally」を加えることで「完全に」同意していることを強調します。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-25',
    phrase: "Just in case.",
    blankWord: "case",
    meaning: "念のため、万が一に備えて",
    nuance: "予防措置として何かをする時に使う表現。準備周到な印象を与えます。",
    examples: [
      { english: "A: Why are you bringing an umbrella? It's sunny.\nB: Just in case. You never know.", japanese: "A: なんで傘持ってくの？晴れてるのに。\nB: 念のため。何があるかわからないから。" },
      { english: "A: I'll send you a reminder email just in case.\nB: Thanks, that would be helpful.", japanese: "A: 念のためリマインダーメール送るね。\nB: ありがとう、助かるよ。" }
    ],
    quiz: { question: "晴れているのに傘を持っていく理由を「Just in case.」と説明する意図は？", options: ["万が一雨が降るかもしれないから", "傘が好きだから", "特に理由はない"], correct: 0, explanation: "「Just in case.」は予防措置や準備の理由を簡潔に伝えられます。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-26',
    phrase: "I'm swamped.",
    blankWord: "swamped",
    meaning: "めちゃくちゃ忙しい",
    nuance: "仕事などで非常に忙しい状態を表す口語表現。「swamp」は「沼地」で、仕事に溺れているイメージです。",
    examples: [
      { english: "A: Can you help me with this?\nB: Sorry, I'm swamped right now. Maybe later?", japanese: "A: これ手伝ってくれる？\nB: ごめん、今めっちゃ忙しいんだ。後でいい？" },
      { english: "A: How's work going?\nB: I'm swamped with deadlines this week.", japanese: "A: 仕事どう？\nB: 今週は締め切りで忙殺されてるよ。" }
    ],
    quiz: { question: "「I'm swamped.」の「swamped」の元の意味は？", options: ["沼地に沈む・水浸しになる", "走る", "眠る"], correct: 0, explanation: "「swamp（沼）」から来ており、仕事に溺れているイメージです。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-27',
    phrase: "Let's grab a coffee.",
    blankWord: "grab",
    meaning: "コーヒーでも飲もうよ",
    nuance: "カジュアルにコーヒーに誘う表現。「grab」は「さっと取る」という意味で、気軽な誘いのニュアンスがあります。",
    examples: [
      { english: "A: Do you have time after the meeting?\nB: Sure! Let's grab a coffee.", japanese: "A: 会議の後、時間ある？\nB: あるよ！コーヒーでも飲もう。" },
      { english: "A: We should catch up sometime.\nB: Definitely! Let's grab a coffee next week.", japanese: "A: いつか会おうよ。\nB: ぜひ！来週コーヒーでも。" }
    ],
    quiz: { question: "「Let's grab a coffee.」の「grab」が伝えるニュアンスは？", options: ["気軽にサッと", "長時間ゆっくり", "緊張感を持って"], correct: 0, explanation: "「grab」には「さっと取る」という意味があり、カジュアルさを演出します。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-28',
    phrase: "I'm on the same page.",
    blankWord: "page",
    meaning: "同じ考えです、理解しています",
    nuance: "相手と同じ理解や認識を持っていることを確認する表現。ビジネスでよく使われます。",
    examples: [
      { english: "A: So the budget is $5000 and deadline is March.\nB: Yes, I'm on the same page.", japanese: "A: 予算は5000ドルで、締め切りは3月ね。\nB: はい、同じ認識です。" },
      { english: "A: Let's make sure we're on the same page before we continue.\nB: Good idea.", japanese: "A: 続ける前に認識を合わせておこう。\nB: いい考えだね。" }
    ],
    quiz: { question: "ビジネスで「Let's make sure we're on the same page.」と言う目的は？", options: ["認識のズレを防ぐため確認する", "会議を終わらせる", "反対意見を述べる"], correct: 0, explanation: "プロジェクト開始前などに認識を揃えることで、後のトラブルを防ぎます。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-29',
    phrase: "Fair enough.",
    blankWord: "enough",
    meaning: "なるほど、もっともだ",
    nuance: "相手の主張を受け入れる時に使う表現。完全に同意しているわけではないが、理解はできるというニュアンスです。",
    examples: [
      { english: "A: I can't come because I have to work.\nB: Fair enough. Maybe next time.", japanese: "A: 仕事があるから行けないんだ。\nB: そっか、仕方ないね。また今度。" },
      { english: "A: I'd rather not share my personal information.\nB: Fair enough. That's your right.", japanese: "A: 個人情報は共有したくないな。\nB: もっともだね。それは当然の権利だ。" }
    ],
    quiz: { question: "「Fair enough.」は完全な同意と比べてどんなニュアンス？", options: ["100%ではないが理解・受け入れる", "完全に賛成", "強く反対"], correct: 0, explanation: "「Fair enough.」は「まあ、それも一理ある」という控えめな受け入れを示します。" },
    generated_at: new Date().toISOString()
  },
  {
    id: 'mock-30',
    phrase: "I've got to go.",
    blankWord: "got",
    meaning: "もう行かなきゃ",
    nuance: "会話を終えて立ち去る時に使う表現。「I have to go」よりカジュアルです。",
    examples: [
      { english: "A: It was great talking to you!\nB: Same here! I've got to go, but let's do this again.", japanese: "A: 話せて楽しかった！\nB: 私も！行かなきゃだけど、また話そう。" },
      { english: "A: I've got to go. My train leaves in 5 minutes.\nB: OK, take care!", japanese: "A: もう行かなきゃ。電車が5分で出るんだ。\nB: わかった、気をつけてね！" }
    ],
    quiz: { question: "「I've got to go.」と「I have to go.」の関係は？", options: ["同じ意味でgot toの方がカジュアル", "全く違う意味", "got toの方がフォーマル"], correct: 0, explanation: "「I've got to」は「I have to」のカジュアル版で、日常会話で頻繁に使われます。" },
    generated_at: new Date().toISOString()
  }
]

// 日付ベースでフレーズを選択
function getDailyPhrase() {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const index = (dayOfYear + 1) % mockPhrases.length  // +1 で別バージョン
  return mockPhrases[index]
}

async function getLatestPhrase() {
  // Supabaseが設定されていない場合はモックデータを使用
  if (!supabase) {
    return getDailyPhrase()
  }

  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest phrase:', error)
      return getDailyPhrase()  // フォールバック：日付ベースで選択
    }

    // blank_word -> blankWord に変換（Supabase→フロントエンド）
    return {
      ...data,
      blankWord: data.blank_word
    }
  } catch {
    return getDailyPhrase()  // フォールバック：日付ベースで選択
  }
}

export default async function Home() {
  const latestPhrase = await getLatestPhrase()

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヒーローセクション */}
      <section className="text-center mb-2 animate-fade-in-up">
        {/* 今日のことわざ */}
        <DailyProverb />

        <h2 className={`text-4xl font-bold text-emerald-600 font-serif mb-6 ${lora.className}`}>
          Today's quiz
        </h2>
      </section>

      {/* 最新フレーズ */}
      {latestPhrase ? (
        <PhraseCard phrase={latestPhrase} />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
          <Lightbulb className="w-12 h-12 text-[#ffd700] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#eab308] mb-2">
            フレーズを準備中...
          </h3>
          <p className="text-stone-600 text-sm">
            まもなく最初のフレーズが配信されます。お楽しみに！
          </p>
        </div>
      )}

      {/* 過去の格言、クイズ */}
      <PastArchive />

    </div>
  )
}
