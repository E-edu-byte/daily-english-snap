'use client'

import { MessageSquare, BookText, Volume2, PenLine, Eye } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import DoneButton from './DoneButton'
import Link from 'next/link'
import { Level, DEFAULT_LEVEL } from '../types'

interface Example {
  english: string
  japanese: string
}

// 単語の状態を管理する型
interface WordState {
  typedChars: string  // 入力済み文字
  revealed: boolean   // 長押しで表示されたか
}

// 穴埋め用の単語コンポーネント
interface FillInWordProps {
  word: string
  wordKey: string
  state: WordState
  isActive: boolean
  onTap: () => void
  onType: (char: string) => void
  onReveal: () => void
}

function FillInWord({ word, wordKey, state, isActive, onTap, onType, onReveal }: FillInWordProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 完了判定（全文字入力済み or 表示済み）
  const isComplete = state.revealed || state.typedChars.length >= word.length

  // 表示文字列を生成
  const displayText = () => {
    if (state.revealed) return word

    let result = ''
    for (let i = 0; i < word.length; i++) {
      if (i < state.typedChars.length) {
        // 入力済み: 元の文字を表示（大文字小文字を維持）
        result += word[i]
      } else {
        // 未入力: アンダースコアか記号
        const char = word[i]
        if (/[a-zA-Z]/.test(char)) {
          result += '_'
        } else {
          // 句読点などはそのまま表示
          result += char
        }
      }
    }
    return result
  }

  // アクティブになったらinputにフォーカス
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  // キー入力処理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isActive || isComplete) return

    const key = e.key
    if (key.length === 1) {
      e.preventDefault()
      onType(key)
    }
  }

  // 長押し開始
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onReveal()
    }, 500) // 500ms長押しで表示
  }

  // 長押しキャンセル
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // マウス用長押し
  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      onReveal()
    }, 500)
  }

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <span className="relative inline-block">
      <span
        onClick={() => !isComplete && onTap()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`
          font-mono tracking-wider px-1 py-0.5 rounded cursor-pointer select-none
          ${isComplete
            ? 'text-emerald-700 bg-emerald-50'
            : isActive
              ? 'bg-amber-200 text-stone-900 ring-2 ring-amber-400'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }
        `}
      >
        {displayText()}
        {isActive && !isComplete && <span className="animate-pulse">|</span>}
      </span>
      {isActive && !isComplete && (
        <input
          ref={inputRef}
          type="text"
          className="absolute opacity-0 w-0 h-0"
          onKeyDown={handleKeyDown}
          onBlur={() => inputRef.current?.focus()}
          autoComplete="off"
          autoCapitalize="off"
        />
      )}
    </span>
  )
}

interface Phrase {
  id: string
  phrase: string
  blankWord?: string  // 空欄にする単語
  meaning: string
  nuance: string
  examples: Example[]
  generated_at: string
}

interface PhraseCardProps {
  phrase: Phrase
  date?: string  // YYYY-MM-DD形式。アーカイブページ用
  level?: Level  // レベル。DoneButtonに渡す
}

// 今日のJST日付を取得
function getTodayJST(): string {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().split('T')[0]
}

export default function PhraseCard({ phrase, date, level = DEFAULT_LEVEL }: PhraseCardProps) {
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [speakingPerson, setSpeakingPerson] = useState<'A' | 'B' | null>(null)
  const [showBlankAnswer, setShowBlankAnswer] = useState(false)
  const [exampleMode, setExampleMode] = useState<'fillIn' | 'showAnswers'>('fillIn')
  const [wordStates, setWordStates] = useState<Record<string, WordState>>({})
  const [activeWordKey, setActiveWordKey] = useState<string | null>(null)
  const todayJST = getTodayJST()

  // テキストを単語に分割（句読点は単語にくっつける）
  const parseWords = useCallback((text: string): string[] => {
    // 単語単位で分割（スペースで区切る）
    return text.split(/\s+/).filter(w => w.length > 0)
  }, [])

  // 単語キーを生成
  const getWordKey = (exampleIndex: number, lineIndex: number, wordIndex: number) => {
    return `${phrase.id}-${exampleIndex}-${lineIndex}-${wordIndex}`
  }

  // フレーズが変わったら答えの状態をリセット
  useEffect(() => {
    setShowBlankAnswer(false)
    setWordStates({})
    setActiveWordKey(null)
  }, [phrase.id])

  // 単語をタップ
  const handleWordTap = (wordKey: string) => {
    setActiveWordKey(wordKey)
  }

  // 文字を入力
  const handleWordType = (wordKey: string, word: string, char: string) => {
    const currentState = wordStates[wordKey] || { typedChars: '', revealed: false }
    if (currentState.revealed) return

    const nextCharIndex = currentState.typedChars.length
    if (nextCharIndex >= word.length) return

    // 次に入力すべき文字を取得（句読点などはスキップ）
    let targetIndex = nextCharIndex
    while (targetIndex < word.length && !/[a-zA-Z]/.test(word[targetIndex])) {
      targetIndex++
    }

    if (targetIndex >= word.length) return

    const expectedChar = word[targetIndex].toLowerCase()
    const inputChar = char.toLowerCase()

    if (inputChar === expectedChar) {
      // 正解: 次の文字まで（句読点を含む）を追加
      let newTypedChars = currentState.typedChars
      for (let i = nextCharIndex; i <= targetIndex; i++) {
        newTypedChars += word[i]
      }

      // 続く句読点も自動追加
      let autoAddIndex = targetIndex + 1
      while (autoAddIndex < word.length && !/[a-zA-Z]/.test(word[autoAddIndex])) {
        newTypedChars += word[autoAddIndex]
        autoAddIndex++
      }

      setWordStates(prev => ({
        ...prev,
        [wordKey]: { ...currentState, typedChars: newTypedChars }
      }))

      // 完了したら次の単語へ
      if (newTypedChars.length >= word.length) {
        setActiveWordKey(null)
      }
    }
    // 不正解は無視
  }

  // 長押しで答え表示
  const handleWordReveal = (wordKey: string) => {
    setWordStates(prev => ({
      ...prev,
      [wordKey]: { typedChars: '', revealed: true }
    }))
    setActiveWordKey(null)
  }

  // 単語の状態を取得
  const getWordState = (wordKey: string): WordState => {
    return wordStates[wordKey] || { typedChars: '', revealed: false }
  }

  // フレーズを空欄付きで表示
  const renderPhraseWithBlank = () => {
    if (!phrase.blankWord) {
      return <span>{phrase.phrase}</span>
    }

    const parts = phrase.phrase.split(phrase.blankWord)
    if (parts.length < 2) {
      return <span>{phrase.phrase}</span>
    }

    return (
      <>
        {parts[0]}
        <button
          onClick={() => setShowBlankAnswer(!showBlankAnswer)}
          className={`mx-1 px-3 py-1 rounded-lg font-bold transition-all ${
            showBlankAnswer
              ? 'bg-red-100 text-red-600 cursor-pointer'
              : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 cursor-pointer border-2 border-dashed border-emerald-400'
          }`}
        >
          {showBlankAnswer ? phrase.blankWord : '???'}
        </button>
        {parts.slice(1).join(phrase.blankWord)}
      </>
    )
  }

  // 音声を読み込む
  useEffect(() => {
    // 音声リストを事前に読み込む
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      // voiceschanged イベントで再読み込み
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 音声再生機能（通常のテキスト用）
  const speak = (text: string, id: string) => {
    // 既に再生中の場合は停止
    if (isPlaying) {
      window.speechSynthesis.cancel()
      if (isPlaying === id) {
        setIsPlaying(null)
        setSpeakingPerson(null)
        return
      }
    }

    // Web Speech API を使用して音声を再生
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9 // 少しゆっくり話す

    utterance.onstart = () => setIsPlaying(id)
    utterance.onend = () => {
      setIsPlaying(null)
      setSpeakingPerson(null)
    }
    utterance.onerror = () => {
      setIsPlaying(null)
      setSpeakingPerson(null)
    }

    window.speechSynthesis.speak(utterance)
  }

  // 会話形式の音声再生機能（AとBを演じ分け）
  const speakConversation = (text: string, id: string) => {
    // 既に再生中の場合は停止
    if (isPlaying) {
      window.speechSynthesis.cancel()
      if (isPlaying === id) {
        setIsPlaying(null)
        setSpeakingPerson(null)
        return
      }
    }

    // テキストをAとBに分割（"A: "と"B: "で分割）
    const lines = text.split('\n').filter(line => line.trim())
    const conversations: Array<{ person: 'A' | 'B', text: string }> = []

    lines.forEach(line => {
      if (line.startsWith('A:')) {
        conversations.push({ person: 'A', text: line.replace(/^A:\s*/, '') })
      } else if (line.startsWith('B:')) {
        conversations.push({ person: 'B', text: line.replace(/^B:\s*/, '') })
      }
    })

    if (conversations.length === 0) {
      // AとBの形式でない場合は通常の再生
      speak(text, id)
      return
    }

    // 利用可能な音声を取得
    const voices = window.speechSynthesis.getVoices()

    // Aさん用の男性の声を探す
    const maleVoice = voices.find(voice =>
      voice.lang.startsWith('en') &&
      (voice.name.includes('Male') || voice.name.includes('David') || voice.name.includes('Mark'))
    ) || voices.find(voice => voice.lang.startsWith('en') && !voice.name.includes('Female'))

    setIsPlaying(id)
    let currentIndex = 0

    const speakNext = () => {
      if (currentIndex >= conversations.length) {
        setIsPlaying(null)
        setSpeakingPerson(null)
        return
      }

      const { person, text: dialogueText } = conversations[currentIndex]
      setSpeakingPerson(person)

      const utterance = new SpeechSynthesisUtterance(dialogueText)
      utterance.lang = 'en-US'
      utterance.rate = 0.9

      // Aさん: 男性の声、Bさん: デフォルトの声（メインフレーズと同じ）
      if (person === 'A') {
        if (maleVoice) utterance.voice = maleVoice
        utterance.pitch = 0.9 // 男性らしい低めのトーン
        utterance.volume = 1.0 // 最大音量（低音は小さく聞こえやすいため）
      } else {
        // Bさんはデフォルトの音声を使用（voiceを指定しない）
        utterance.pitch = 1.0 // デフォルトのトーン
        utterance.volume = 0.7 // 高音は大きく聞こえやすいため、さらに音量を下げる
      }

      utterance.onend = () => {
        currentIndex++
        // 次の発言の前に300msの間を入れる
        setTimeout(() => {
          speakNext()
        }, 300)
      }

      utterance.onerror = () => {
        setIsPlaying(null)
        setSpeakingPerson(null)
      }

      window.speechSynthesis.speak(utterance)
    }

    speakNext()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden animate-fade-in-up">
      {/* ヘッダー */}
      <div className="bg-[#ffed4e] px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左側：フレーズ情報 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-extrabold font-serif text-stone-900" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                {renderPhraseWithBlank()}
              </h3>
              {showBlankAnswer && (
                <button
                  onClick={() => speak(phrase.phrase, 'main-phrase')}
                  className="p-2 hover:bg-amber-200 bg-stone-900/10 rounded-full transition-all hover-scale"
                  title="音声を再生"
                >
                  <Volume2 className={`w-6 h-6 text-stone-900 ${isPlaying === 'main-phrase' ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>
            <p className="text-lg text-stone-800 font-medium">{phrase.meaning}</p>
            {!showBlankAnswer && phrase.blankWord && (
              <p className="text-emerald-600 text-sm font-medium mt-2">
                👆 ??? をタップして答えを確認！
              </p>
            )}
          </div>

          {/* 右側：学習記録・シェア */}
          <div className="flex flex-col justify-center lg:min-w-[280px] lg:border-l-2 lg:border-stone-900/10 lg:pl-6">
            <p className="text-sm text-stone-600 mb-2">Update：{formatDate(phrase.generated_at)}</p>
            <div className="flex items-center gap-2">
              <DoneButton phraseId={phrase.id} date={date} level={level} />
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`1日１回英語フレーズを学ぼう\n格言もあるよ！\n\n`)}&url=${encodeURIComponent(`https://english.news-navi.jp?d=${todayJST}`)}&hashtags=DailyEnglishSnap,英語学習`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                title="Xでシェア"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="hidden sm:inline">シェア</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ニュアンス解説 */}
      <div className="p-6 bg-orange-50 border-b border-stone-200">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-emerald-600 mb-2">ニュアンス</h4>
            <p className="text-stone-700 leading-relaxed">{phrase.nuance}</p>
          </div>
        </div>
      </div>

      {/* 例文 */}
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <BookText className="w-5 h-5 text-emerald-500" />
          <h4 className="font-semibold text-emerald-600">例文</h4>
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setExampleMode('fillIn')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                exampleMode === 'fillIn'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              穴埋め
            </button>
            <button
              onClick={() => setExampleMode('showAnswers')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                exampleMode === 'showAnswers'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              正解を表示
            </button>
          </div>
        </div>

        {exampleMode === 'fillIn' && (
          <p className="text-xs text-stone-500 mb-3">
            💡 単語をタップして入力開始、長押しで答えを表示
          </p>
        )}

        <div className="space-y-4">
          {phrase.examples.map((example, exampleIndex) => {
            const lines = example.english.split('\n').filter(line => line.trim())
            const isPlayingThis = isPlaying === `example-${exampleIndex}`

            return (
              <div key={exampleIndex} className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <div className="flex items-start gap-2 mb-1">
                  <div className="flex-1 space-y-2">
                    {lines.map((line, lineIndex) => {
                      const personMatch = line.match(/^([AB]):\s*(.+)/)

                      if (personMatch) {
                        const [, person, text] = personMatch
                        const isActive = isPlayingThis && speakingPerson === person
                        const words = parseWords(text)

                        return (
                          <div key={lineIndex} className={`transition-all ${isActive ? 'bg-amber-100 px-2 py-1 rounded' : ''}`}>
                            <span className="font-semibold text-stone-500 mr-2">{person}:</span>
                            {exampleMode === 'showAnswers' ? (
                              <span className={`font-medium ${isActive ? 'text-[#eab308] font-bold' : 'text-stone-900'}`}>
                                {text}
                              </span>
                            ) : (
                              <span className="inline-flex flex-wrap gap-1.5">
                                {words.map((word, wordIndex) => {
                                  const wordKey = getWordKey(exampleIndex, lineIndex, wordIndex)
                                  return (
                                    <FillInWord
                                      key={wordKey}
                                      word={word}
                                      wordKey={wordKey}
                                      state={getWordState(wordKey)}
                                      isActive={activeWordKey === wordKey}
                                      onTap={() => handleWordTap(wordKey)}
                                      onType={(char) => handleWordType(wordKey, word, char)}
                                      onReveal={() => handleWordReveal(wordKey)}
                                    />
                                  )
                                })}
                              </span>
                            )}
                          </div>
                        )
                      }

                      // A/B形式でない行
                      const words = parseWords(line)
                      return (
                        <div key={lineIndex}>
                          {exampleMode === 'showAnswers' ? (
                            <p className="font-medium text-stone-900">{line}</p>
                          ) : (
                            <span className="inline-flex flex-wrap gap-1.5">
                              {words.map((word, wordIndex) => {
                                const wordKey = getWordKey(exampleIndex, lineIndex, wordIndex)
                                return (
                                  <FillInWord
                                    key={wordKey}
                                    word={word}
                                    wordKey={wordKey}
                                    state={getWordState(wordKey)}
                                    isActive={activeWordKey === wordKey}
                                    onTap={() => handleWordTap(wordKey)}
                                    onType={(char) => handleWordType(wordKey, word, char)}
                                    onReveal={() => handleWordReveal(wordKey)}
                                  />
                                )
                              })}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => speakConversation(example.english, `example-${exampleIndex}`)}
                    className="p-1.5 hover:bg-amber-300 bg-amber-400 rounded-full transition-all hover-scale flex-shrink-0"
                    title="会話を再生"
                  >
                    <Volume2 className={`w-4 h-4 text-stone-900 ${isPlayingThis ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                <p className="text-stone-600 text-sm whitespace-pre-wrap mt-2">{example.japanese}</p>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
