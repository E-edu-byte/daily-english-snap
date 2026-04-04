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
  state: WordState
  isActive: boolean
  onTap: () => void
  onType: (char: string) => void
  onReveal: () => void
  onDeactivate: () => void
}

function FillInWord({ word, state, isActive, onTap, onType, onReveal, onDeactivate }: FillInWordProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 完了判定（全文字入力済み or 表示済み）
  const isComplete = state.revealed || state.typedChars.length >= word.length

  // 表示を生成（カーソル位置を含む）
  const renderDisplay = () => {
    if (state.revealed) return <>{word}</>

    const typedLength = state.typedChars.length
    let beforeCursor = ''
    let afterCursor = ''

    for (let i = 0; i < word.length; i++) {
      if (i < typedLength) {
        // 入力済み: 元の文字を表示
        beforeCursor += word[i]
      } else {
        // 未入力: アンダースコアか記号
        const char = word[i]
        if (/[a-zA-Z]/.test(char)) {
          afterCursor += '_'
        } else {
          afterCursor += char
        }
      }
    }

    // カーソルは入力済み部分と未入力部分の間に表示
    return (
      <>
        {beforeCursor}
        {isActive && !isComplete && <span className="animate-pulse text-emerald-500">|</span>}
        {afterCursor}
      </>
    )
  }

  // アクティブになったらフォーカス
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  // 入力処理
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length > 0) {
      const lastChar = value[value.length - 1]
      onType(lastChar)
      e.target.value = '' // クリア
    }
  }

  // キーボードイベント（PC対応）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onDeactivate()
    }
  }

  // 長押し開始
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onReveal()
    }, 500)
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

  // タップ/クリック処理
  const handleClick = () => {
    if (!isComplete) {
      onTap()
      // 少し遅延させてフォーカス（モバイル対応）
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  return (
    <span
      className={`
        relative font-mono tracking-wider px-1 py-0.5 rounded cursor-pointer select-none inline-block
        ${isComplete
          ? 'text-emerald-700 bg-emerald-50'
          : isActive
            ? 'bg-amber-200 text-stone-900 ring-2 ring-amber-400'
            : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
        }
      `}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {renderDisplay()}
      {/* 透明な入力フィールド（キーボード表示用） */}
      {isActive && !isComplete && (
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ fontSize: '16px' }} // iOSのズーム防止
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // モバイルでキーボードが閉じた時に非アクティブ化しない
            // 代わりに他の単語をタップした時に切り替わる
          }}
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

  // 全単語のキーと単語を順番に取得
  const getAllWordKeysWithWords = useCallback((): Array<{ key: string; word: string }> => {
    const result: Array<{ key: string; word: string }> = []

    phrase.examples.forEach((example, exampleIndex) => {
      const lines = example.english.split('\n').filter(line => line.trim())
      lines.forEach((line, lineIndex) => {
        const personMatch = line.match(/^([AB]):\s*(.+)/)
        const text = personMatch ? personMatch[2] : line
        const words = parseWords(text)
        words.forEach((word, wordIndex) => {
          const key = getWordKey(exampleIndex, lineIndex, wordIndex)
          result.push({ key, word })
        })
      })
    })

    return result
  }, [phrase.examples, parseWords, getWordKey])

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

  // 単語を非アクティブ化
  const handleWordDeactivate = () => {
    setActiveWordKey(null)
  }

  // 次の未完了単語を見つけてアクティブにする
  const activateNextWord = useCallback((currentKey: string, updatedWordStates: Record<string, WordState>) => {
    const allWords = getAllWordKeysWithWords()
    const currentIndex = allWords.findIndex(w => w.key === currentKey)

    // 現在の位置から後ろを検索
    for (let i = currentIndex + 1; i < allWords.length; i++) {
      const { key, word } = allWords[i]
      const state = updatedWordStates[key] || { typedChars: '', revealed: false }
      const isComplete = state.revealed || state.typedChars.length >= word.length
      if (!isComplete) {
        setActiveWordKey(key)
        return
      }
    }

    // 見つからなければ非アクティブ
    setActiveWordKey(null)
  }, [getAllWordKeysWithWords])

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

      const updatedState = { ...currentState, typedChars: newTypedChars }
      const updatedWordStates = {
        ...wordStates,
        [wordKey]: updatedState
      }

      setWordStates(updatedWordStates)

      // 完了したら次の単語へ自動移動
      if (newTypedChars.length >= word.length) {
        activateNextWord(wordKey, updatedWordStates)
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

  // A/B個別の音声再生（モバイル対応改善）
  const speakPerson = (text: string, person: 'A' | 'B', id: string) => {
    // 既に再生中の場合は停止
    if (isPlaying) {
      window.speechSynthesis.cancel()
      if (isPlaying === id) {
        setIsPlaying(null)
        setSpeakingPerson(null)
        return
      }
    }

    const voices = window.speechSynthesis.getVoices()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9

    if (person === 'A') {
      // Aさん: 男性の声
      const maleVoice = voices.find(voice =>
        voice.lang.startsWith('en') &&
        (voice.name.includes('Male') || voice.name.includes('David') || voice.name.includes('Mark'))
      ) || voices.find(voice => voice.lang.startsWith('en') && !voice.name.includes('Female'))
      if (maleVoice) utterance.voice = maleVoice
      utterance.pitch = 0.9  // 男性らしい低めのトーン
      utterance.volume = 1.0
    } else {
      // Bさん: デフォルトの声
      utterance.pitch = 1.0  // デフォルトのトーン
      utterance.volume = 0.7
    }

    setIsPlaying(id)
    setSpeakingPerson(person)

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

            return (
              <div key={exampleIndex} className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <div className="flex items-start gap-2 mb-1">
                  <div className="flex-1 space-y-2">
                    {lines.map((line, lineIndex) => {
                      const personMatch = line.match(/^([AB]):\s*(.+)/)

                      if (personMatch) {
                        const [, person, text] = personMatch
                        const speakId = `example-${exampleIndex}-${person}-${lineIndex}`
                        const isPlayingThisLine = isPlaying === speakId
                        const isActive = isPlayingThisLine && speakingPerson === person
                        const words = parseWords(text)

                        return (
                          <div key={lineIndex} className={`flex items-start gap-2 transition-all ${isActive ? 'bg-amber-100 px-2 py-1 rounded' : ''}`}>
                            <div className="flex-1">
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
                                        state={getWordState(wordKey)}
                                        isActive={activeWordKey === wordKey}
                                        onTap={() => handleWordTap(wordKey)}
                                        onType={(char) => handleWordType(wordKey, word, char)}
                                        onReveal={() => handleWordReveal(wordKey)}
                                        onDeactivate={handleWordDeactivate}
                                      />
                                    )
                                  })}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => speakPerson(text, person as 'A' | 'B', speakId)}
                              className="p-1 hover:bg-amber-300 bg-amber-400 rounded-full transition-all hover-scale flex-shrink-0"
                              title={`${person}の音声を再生`}
                            >
                              <Volume2 className={`w-3.5 h-3.5 text-stone-900 ${isPlayingThisLine ? 'animate-pulse' : ''}`} />
                            </button>
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
                                    state={getWordState(wordKey)}
                                    isActive={activeWordKey === wordKey}
                                    onTap={() => handleWordTap(wordKey)}
                                    onType={(char) => handleWordType(wordKey, word, char)}
                                    onReveal={() => handleWordReveal(wordKey)}
                                    onDeactivate={handleWordDeactivate}
                                  />
                                )
                              })}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
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
