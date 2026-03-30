'use client'

import { useState, useEffect } from 'react'
import { Lora } from 'next/font/google'
import { MessageSquare, BookText, Volume2 } from 'lucide-react'
import DoneButton from './DoneButton'

const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

const quizzes = [
  {
    id: 'quiz-1',
    phrase: "It's on the tip of my _____.",
    answer: "tongue",
    hint: "喉まで出かかっているのに...",
    meaning: "思い出せそうで思い出せない",
    nuance: "何かを思い出そうとしているけれど、あと少しで出てこない状態を表します。会話中に名前や言葉が出てこない時によく使われます。",
    examples: [
      { english: "A: What's the name of that actor?\nB: It's on the tip of my tongue... Oh, Tom Hanks!", japanese: "A: あの俳優の名前なんだっけ？\nB: 喉まで出かかってるんだけど...あ、トム・ハンクスだ！" }
    ]
  },
  {
    id: 'quiz-2',
    phrase: "Let's call it a _____.",
    answer: "day",
    hint: "今日はここまでにしよう",
    meaning: "今日は終わりにしよう",
    nuance: "仕事や作業を切り上げる時に使います。疲れた時や十分な成果が出た時に、自然に使える便利なフレーズです。",
    examples: [
      { english: "A: We've been working for 8 hours.\nB: Let's call it a day and continue tomorrow.", japanese: "A: もう8時間も働いてるね。\nB: 今日はここまでにして、明日続きをやろう。" }
    ]
  },
  {
    id: 'quiz-3',
    phrase: "You're pulling my _____.",
    answer: "leg",
    hint: "からかってるでしょ？",
    meaning: "冗談でしょ？",
    nuance: "相手が冗談を言っていると思った時に使います。信じられないような話を聞いた時の反応として自然です。",
    examples: [
      { english: "A: I won the lottery!\nB: You're pulling my leg, right?", japanese: "A: 宝くじ当たったんだ！\nB: 冗談でしょ？" }
    ]
  },
  {
    id: 'quiz-4',
    phrase: "Break a _____!",
    answer: "leg",
    hint: "舞台の前に言う言葉",
    meaning: "頑張って！（幸運を祈る）",
    nuance: "直訳は「足を折れ」ですが、実際は幸運を祈る表現。特に舞台やパフォーマンスの前に使われます。",
    examples: [
      { english: "A: I'm so nervous about my presentation.\nB: Break a leg! You'll do great.", japanese: "A: プレゼン緊張するなあ。\nB: 頑張って！うまくいくよ。" }
    ]
  },
  {
    id: 'quiz-5',
    phrase: "It's a piece of _____.",
    answer: "cake",
    hint: "簡単すぎる！",
    meaning: "朝飯前だよ",
    nuance: "何かがとても簡単だと言いたい時に使います。自信を持って「楽勝だよ」と伝えられます。",
    examples: [
      { english: "A: Can you fix this computer?\nB: Sure, it's a piece of cake.", japanese: "A: このパソコン直せる？\nB: もちろん、朝飯前だよ。" }
    ]
  },
  {
    id: 'quiz-6',
    phrase: "Hit the _____.",
    answer: "road",
    hint: "さあ出発だ",
    meaning: "出発しよう",
    nuance: "旅行や外出に出発する時のカジュアルな表現。「さあ行こう」という気持ちを込めて使います。",
    examples: [
      { english: "A: Are you ready?\nB: Yes, let's hit the road!", japanese: "A: 準備できた？\nB: うん、さあ出発しよう！" }
    ]
  },
  {
    id: 'quiz-7',
    phrase: "Spill the _____.",
    answer: "beans",
    hint: "秘密を教えて！",
    meaning: "秘密をばらす",
    nuance: "秘密や情報を明かすよう促す時に使います。ゴシップ好きな友達との会話でよく出てきます。",
    examples: [
      { english: "A: I heard you have big news.\nB: Okay, I'll spill the beans. I'm getting married!", japanese: "A: 大きなニュースがあるって聞いたよ。\nB: わかった、言うね。結婚するの！" }
    ]
  },
  {
    id: 'quiz-8',
    phrase: "Cost an arm and a _____.",
    answer: "leg",
    hint: "めちゃくちゃ高い",
    meaning: "非常に高価である",
    nuance: "何かがとても高価だと強調したい時に使います。びっくりするほど高い買い物の話で使えます。",
    examples: [
      { english: "A: How much was your new car?\nB: It cost an arm and a leg, but it's worth it.", japanese: "A: 新車いくらだった？\nB: めちゃくちゃ高かったけど、その価値はあるよ。" }
    ]
  },
  {
    id: 'quiz-9',
    phrase: "Under the _____.",
    answer: "weather",
    hint: "体調がすぐれない",
    meaning: "具合が悪い",
    nuance: "軽い体調不良を表す控えめな表現。風邪気味や少し疲れている時に使います。",
    examples: [
      { english: "A: You don't look so good.\nB: Yeah, I'm feeling a bit under the weather today.", japanese: "A: 顔色悪いね。\nB: うん、今日ちょっと体調悪いんだ。" }
    ]
  },
  {
    id: 'quiz-10',
    phrase: "The ball is in your _____.",
    answer: "court",
    hint: "次はあなたの番",
    meaning: "決定権はあなたにある",
    nuance: "テニスのコートが由来。次のアクションや決定は相手次第だと伝える時に使います。",
    examples: [
      { english: "A: I made my offer.\nB: The ball is in your court now.", japanese: "A: 私の提案は出したよ。\nB: あとはあなた次第だね。" }
    ]
  },
  {
    id: 'quiz-11',
    phrase: "Bite the _____.",
    answer: "bullet",
    hint: "覚悟を決めて",
    meaning: "困難に立ち向かう",
    nuance: "避けられない困難や不快なことに覚悟を決めて取り組む時に使います。",
    examples: [
      { english: "A: I don't want to tell him the bad news.\nB: Just bite the bullet and do it.", japanese: "A: 彼に悪い知らせを伝えたくないな。\nB: 覚悟を決めてやるしかないよ。" }
    ]
  },
  {
    id: 'quiz-12',
    phrase: "Sleep on _____.",
    answer: "it",
    hint: "急いで決めないで",
    meaning: "一晩考える",
    nuance: "重要な決断を急がず、一晩寝て考えることを提案する時に使います。",
    examples: [
      { english: "A: Should I accept the job offer?\nB: Sleep on it. You don't have to decide today.", japanese: "A: その仕事のオファー受けるべきかな？\nB: 一晩考えなよ。今日決める必要ないよ。" }
    ]
  },
  {
    id: 'quiz-13',
    phrase: "Cut to the _____.",
    answer: "chase",
    hint: "本題に入ろう",
    meaning: "要点を言う",
    nuance: "前置きを省いて本題に入りたい時に使います。ビジネスシーンでも使えます。",
    examples: [
      { english: "A: So, about the project...\nB: Let's cut to the chase. What's the budget?", japanese: "A: それで、プロジェクトについてだけど...\nB: 本題に入ろう。予算はいくら？" }
    ]
  },
  {
    id: 'quiz-14',
    phrase: "Miss the _____.",
    answer: "boat",
    hint: "チャンスを逃した",
    meaning: "機会を逃す",
    nuance: "良い機会やチャンスを逃してしまった時に使います。後悔のニュアンスを含みます。",
    examples: [
      { english: "A: The sale ended yesterday.\nB: Oh no, I missed the boat!", japanese: "A: セールは昨日で終わったよ。\nB: ああ、チャンス逃した！" }
    ]
  },
  {
    id: 'quiz-15',
    phrase: "Ring a _____.",
    answer: "bell",
    hint: "聞き覚えがある",
    meaning: "ピンとくる",
    nuance: "何かを聞いて「それ知ってる」「聞いたことある」という感覚を表します。",
    examples: [
      { english: "A: Do you know John Smith?\nB: The name rings a bell, but I can't remember where I met him.", japanese: "A: ジョン・スミスって知ってる？\nB: 名前は聞き覚えあるけど、どこで会ったか思い出せない。" }
    ]
  },
  {
    id: 'quiz-16',
    phrase: "Get out of _____.",
    answer: "hand",
    hint: "制御不能になる",
    meaning: "手に負えなくなる",
    nuance: "状況がコントロールできなくなった時に使います。パーティーが盛り上がりすぎた時などにも。",
    examples: [
      { english: "A: The party got out of hand last night.\nB: What happened?", japanese: "A: 昨夜のパーティー、収拾つかなくなっちゃって。\nB: 何があったの？" }
    ]
  },
  {
    id: 'quiz-17',
    phrase: "On the same _____.",
    answer: "page",
    hint: "考えが一致している",
    meaning: "同じ認識を持っている",
    nuance: "チームやパートナーと意見や理解が一致していることを確認する時に使います。",
    examples: [
      { english: "A: So we agree on the plan?\nB: Yes, we're on the same page.", japanese: "A: じゃあ計画には同意ってことで？\nB: うん、同じ認識だね。" }
    ]
  },
  {
    id: 'quiz-18',
    phrase: "Play it by _____.",
    answer: "ear",
    hint: "臨機応変に",
    meaning: "その場の状況に応じて対処する",
    nuance: "事前に計画を立てず、状況を見て判断することを表します。",
    examples: [
      { english: "A: What's the plan for tomorrow?\nB: Let's play it by ear and see how we feel.", japanese: "A: 明日の予定は？\nB: 臨機応変にいこう、気分次第で。" }
    ]
  },
  {
    id: 'quiz-19',
    phrase: "The last _____.",
    answer: "straw",
    hint: "もう限界...",
    meaning: "我慢の限界",
    nuance: "小さなことの積み重ねで、ついに堪忍袋の緒が切れた瞬間を表します。",
    examples: [
      { english: "A: He was late again today.\nB: That's the last straw. I'm talking to the manager.", japanese: "A: 彼また今日も遅刻だよ。\nB: もう限界。マネージャーに言うわ。" }
    ]
  },
  {
    id: 'quiz-20',
    phrase: "Beat around the _____.",
    answer: "bush",
    hint: "遠回しに言わないで",
    meaning: "遠回しに言う",
    nuance: "直接的に言わず、回りくどい言い方をすることを表します。否定形でよく使われます。",
    examples: [
      { english: "A: Don't beat around the bush. Just tell me the truth.\nB: Okay, I broke your vase.", japanese: "A: 遠回しに言わないで。本当のことを言って。\nB: わかった、君の花瓶を割っちゃったんだ。" }
    ]
  },
  {
    id: 'quiz-21',
    phrase: "A penny for your _____.",
    answer: "thoughts",
    hint: "何を考えてるの？",
    meaning: "何を考えているの？",
    nuance: "黙っている人に、何を考えているか優しく尋ねる時に使います。",
    examples: [
      { english: "A: You've been quiet. A penny for your thoughts?\nB: I'm just thinking about the future.", japanese: "A: 静かだね。何考えてるの？\nB: ちょっと将来のことを考えてて。" }
    ]
  },
  {
    id: 'quiz-22',
    phrase: "Jump on the _____.",
    answer: "bandwagon",
    hint: "流行に乗る",
    meaning: "流行・多数派に便乗する",
    nuance: "人気のあることや流行に便乗することを表します。少し批判的なニュアンスも。",
    examples: [
      { english: "A: Everyone is investing in crypto now.\nB: I don't want to just jump on the bandwagon.", japanese: "A: みんな今仮想通貨に投資してるよね。\nB: 流行に乗るだけはしたくないな。" }
    ]
  },
  {
    id: 'quiz-23',
    phrase: "Once in a blue _____.",
    answer: "moon",
    hint: "めったにない",
    meaning: "ごくまれに",
    nuance: "非常に珍しいこと、めったに起こらないことを表します。",
    examples: [
      { english: "A: Do you go to the gym?\nB: Once in a blue moon. I should go more often.", japanese: "A: ジム行ってる？\nB: たまにね。もっと行くべきなんだけど。" }
    ]
  },
  {
    id: 'quiz-24',
    phrase: "Actions speak louder than _____.",
    answer: "words",
    hint: "口だけじゃダメ",
    meaning: "行動は言葉より雄弁",
    nuance: "言葉よりも行動で示すことが大切だという意味のことわざ的表現。",
    examples: [
      { english: "A: He says he loves me.\nB: Actions speak louder than words. Does he show it?", japanese: "A: 彼は愛してるって言うの。\nB: 行動で示してる？口だけじゃダメよ。" }
    ]
  },
  {
    id: 'quiz-25',
    phrase: "Kill two birds with one _____.",
    answer: "stone",
    hint: "一石二鳥",
    meaning: "一挙両得",
    nuance: "一つの行動で二つの目的を達成することを表します。日本語と同じ発想ですね。",
    examples: [
      { english: "A: I'll visit my parents and pick up my stuff.\nB: Nice, killing two birds with one stone.", japanese: "A: 両親に会いに行って、荷物も取ってくるよ。\nB: いいね、一石二鳥だね。" }
    ]
  },
  {
    id: 'quiz-26',
    phrase: "Speak of the _____.",
    answer: "devil",
    hint: "噂をすれば...",
    meaning: "噂をすれば影",
    nuance: "誰かの話をしていたら、その人が現れた時に使います。",
    examples: [
      { english: "A: I wonder where Tom is.\nB: Speak of the devil! Here he comes.", japanese: "A: トムどこにいるのかな。\nB: 噂をすれば！来たよ。" }
    ]
  },
  {
    id: 'quiz-27',
    phrase: "Back to square _____.",
    answer: "one",
    hint: "振り出しに戻る",
    meaning: "最初からやり直し",
    nuance: "努力が無駄になり、最初の状態に戻ってしまった時に使います。",
    examples: [
      { english: "A: The client rejected our proposal.\nB: Back to square one, I guess.", japanese: "A: クライアントが企画を却下したよ。\nB: 振り出しに戻りか。" }
    ]
  },
  {
    id: 'quiz-28',
    phrase: "Read between the _____.",
    answer: "lines",
    hint: "言外の意味を読む",
    meaning: "行間を読む",
    nuance: "直接言われていない隠された意味を理解することを表します。",
    examples: [
      { english: "A: She said she was 'fine.'\nB: Read between the lines. She's upset.", japanese: "A: 彼女「大丈夫」って言ってたよ。\nB: 行間を読みなよ。怒ってるんだよ。" }
    ]
  },
  {
    id: 'quiz-29',
    phrase: "Get cold _____.",
    answer: "feet",
    hint: "急に怖くなる",
    meaning: "怖気づく",
    nuance: "直前になって急に不安になり、躊躇することを表します。結婚式前などでよく使われます。",
    examples: [
      { english: "A: Are you ready for the interview?\nB: I'm getting cold feet. What if I fail?", japanese: "A: 面接の準備できた？\nB: 怖気づいてきた。失敗したらどうしよう？" }
    ]
  },
  {
    id: 'quiz-30',
    phrase: "The tip of the _____.",
    answer: "iceberg",
    hint: "ほんの一部に過ぎない",
    meaning: "氷山の一角",
    nuance: "見えている問題は全体のほんの一部に過ぎないことを表します。",
    examples: [
      { english: "A: We found 10 errors in the report.\nB: That's just the tip of the iceberg.", japanese: "A: レポートに10個のミスが見つかったよ。\nB: それは氷山の一角だよ。" }
    ]
  },
]

export default function DailyQuiz() {
  const [showAnswer, setShowAnswer] = useState(false)
  const [dailyQuiz, setDailyQuiz] = useState(quizzes[0])
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // 日付ベースでクイズを選択
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    const index = (dayOfYear + 1) % quizzes.length  // +1 で別バージョン
    setDailyQuiz(quizzes[index])
  }, [])

  const handleClick = () => {
    setShowAnswer(!showAnswer)
  }

  // 音声再生機能
  const speak = (text: string) => {
    if (typeof window === 'undefined') return

    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  // 完成したフレーズ
  const fullPhrase = dailyQuiz.phrase.replace('_____', dailyQuiz.answer)

  // 空欄部分を表示用に変換
  const renderPhrase = () => {
    const parts = dailyQuiz.phrase.split('_____')
    return (
      <>
        {parts[0]}
        <button
          onClick={handleClick}
          className={`mx-1 px-3 py-1 rounded-lg font-bold transition-all ${
            showAnswer
              ? 'bg-red-100 text-red-600 cursor-pointer'
              : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 cursor-pointer border-2 border-dashed border-emerald-400'
          }`}
        >
          {showAnswer ? dailyQuiz.answer : '???'}
        </button>
        {parts[1]}
      </>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-8 animate-fade-in-up">
      {/* タイトル */}
      <div className="bg-[#ffed4e] px-6 pt-5 pb-2">
        <h3 className={`text-center ${lora.className}`}>
          <span className="text-4xl font-bold text-emerald-600 font-serif">Today's Quiz</span>
        </h3>
      </div>

      {/* ヘッダー */}
      <div className="bg-[#ffed4e] px-6 pb-5">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左側：問題文 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-extrabold font-serif text-stone-900" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                {renderPhrase()}
              </h3>
              {showAnswer && (
                <button
                  onClick={() => speak(fullPhrase)}
                  className="p-2 hover:bg-amber-200 bg-stone-900/10 rounded-full transition-all hover-scale"
                  title="音声を再生"
                >
                  <Volume2 className={`w-6 h-6 text-stone-900 ${isPlaying ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>
            <p className="text-lg text-stone-800 font-medium">{dailyQuiz.meaning}</p>
            {!showAnswer && (
              <p className="text-emerald-600 text-sm font-medium mt-2">
                👆 ??? をタップして答えを確認！
              </p>
            )}
          </div>

          {/* 右側：ヒント・Done */}
          <div className="flex flex-col justify-center lg:min-w-[280px] lg:border-l-2 lg:border-stone-900/10 lg:pl-6">
            <p className="text-sm text-stone-600 mb-2">💡 ヒント：{dailyQuiz.hint}</p>
            <DoneButton phraseId={dailyQuiz.id} />
          </div>
        </div>
      </div>

      {/* ニュアンス解説 */}
      {showAnswer && (
        <>
          <div className="p-6 bg-orange-50 border-b border-stone-200">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-emerald-600 mb-2">ニュアンス</h4>
                <p className="text-stone-700 leading-relaxed">{dailyQuiz.nuance}</p>
              </div>
            </div>
          </div>

          {/* 例文 */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookText className="w-5 h-5 text-emerald-500" />
              <h4 className="font-semibold text-emerald-600">例文</h4>
            </div>
            <div className="space-y-4">
              {dailyQuiz.examples.map((example, index) => (
                <div key={index} className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => speak(example.english.replace(/[AB]: /g, ''))}
                      className="p-1.5 hover:bg-stone-200 rounded-full transition-all flex-shrink-0"
                      title="音声を再生"
                    >
                      <Volume2 className="w-4 h-4 text-stone-600" />
                    </button>
                    <div className="flex-1">
                      <p className={`text-stone-900 font-medium whitespace-pre-line ${lora.className}`}>
                        {example.english}
                      </p>
                      <p className="text-stone-600 text-sm mt-2 whitespace-pre-line">
                        {example.japanese}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
