import type { Metadata } from 'next'
import { Inter, Lora, Quicksand } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })
const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const quicksand = Quicksand({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Daily English Snap - 毎日届く実用英語フレーズ',
  description: '日常で即レスできる英語フレーズを、1日3回自動配信。例文とクイズで楽しく学習。',
  keywords: ['英語学習', '英会話', 'フレーズ', '例文', 'クイズ', 'Daily English'],
  verification: {
    google: '_0bILKnQoufY0oJ-FQRkW3KdJDtCOXls3NW5LWgjOvU',
  },
}

// Quicksandフォントをエクスポート
export { quicksand }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        {/* Google AdSense 自動広告タグ（プレースホルダー） */}
        {/* 本番環境で以下をアンコメントし、data-ad-client に自分のIDを設定してください */}
        {/*
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
        */}
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-[#fafaf9]">
          <header className="bg-[#ffed4e] shadow-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  <h1 className={`text-2xl md:text-3xl font-extrabold text-stone-900 ${lora.className}`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    📖 Daily English Snap
                  </h1>
                  <p className="text-sm md:text-base text-stone-800 mt-1 font-medium pl-11">
                    １日１回の英語トレーニング
                  </p>
                </Link>
                <Link
                  href="/calendar"
                  className="group flex items-center gap-2 bg-white/80 hover:bg-white px-4 py-3 rounded-full border-2 border-stone-900/20 hover:border-stone-900/40 transition-all hover-scale shadow-sm"
                  title="学習カレンダー"
                >
                  <Calendar className="w-5 h-5 text-stone-900" />
                  <span className="text-sm font-bold text-stone-900">学習記録</span>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>

          <footer className="bg-white border-t border-stone-200 mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-[#eab308]">
              <p>© 2026 Daily English Snap. Powered by Gemini AI & Next.js</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
