'use client'

import { MessageSquare, BookText, Volume2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import DoneButton from './DoneButton'
import Link from 'next/link'

interface Example {
  english: string
  japanese: string
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
}

export default function PhraseCard({ phrase, date }: PhraseCardProps) {
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [speakingPerson, setSpeakingPerson] = useState<'A' | 'B' | null>(null)
  const [showBlankAnswer, setShowBlankAnswer] = useState(false)

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

          {/* 右側：学習記録 */}
          <div className="flex flex-col justify-center lg:min-w-[280px] lg:border-l-2 lg:border-stone-900/10 lg:pl-6">
            <p className="text-sm text-stone-600 mb-2">Update：{formatDate(phrase.generated_at)}</p>
            <DoneButton phraseId={phrase.id} date={date} />
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
        <div className="flex items-center gap-2 mb-4">
          <BookText className="w-5 h-5 text-emerald-500" />
          <h4 className="font-semibold text-emerald-600">例文</h4>
        </div>
        <div className="space-y-4">
          {phrase.examples.map((example, index) => {
            const lines = example.english.split('\n').filter(line => line.trim())
            const isPlayingThis = isPlaying === `example-${index}`

            return (
              <div key={index} className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <div className="flex items-start gap-2 mb-1">
                  <div className="flex-1 space-y-1">
                    {lines.map((line, lineIndex) => {
                      const personMatch = line.match(/^([AB]):\s*(.+)/)
                      if (personMatch) {
                        const [, person, text] = personMatch
                        const isActive = isPlayingThis && speakingPerson === person
                        return (
                          <div key={lineIndex} className={`transition-all ${isActive ? 'bg-amber-100 px-2 py-1 rounded' : ''}`}>
                            <span className="font-semibold text-stone-500 mr-1">{person}:</span>
                            <span className={`font-medium ${isActive ? 'text-[#eab308] font-bold' : 'text-stone-900'}`}>
                              {text}
                            </span>
                          </div>
                        )
                      }
                      return <p key={lineIndex} className="font-medium text-stone-900">{line}</p>
                    })}
                  </div>
                  <button
                    onClick={() => speakConversation(example.english, `example-${index}`)}
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
