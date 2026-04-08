import type { Metadata } from 'next'
import { Inter, Quicksand } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Link from 'next/link'
import Header from './components/Header'

// Google Analytics 測定ID
const GA_MEASUREMENT_ID = 'G-X86N4CXC8B'

const inter = Inter({ subsets: ['latin'] })
const quicksand = Quicksand({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Daily English Snap - 毎日届く実用英語フレーズ',
  description: '穴埋めクイズで英語フレーズを楽しく学習！毎日更新される実用フレーズで英会話力アップ。',
  keywords: ['英語学習', '英会話', 'フレーズ', '例文', 'クイズ', 'Daily English'],
  verification: {
    google: '_0bILKnQoufY0oJ-FQRkW3KdJDtCOXls3NW5LWgjOvU',
  },
  metadataBase: new URL('https://english.news-navi.jp'),
  openGraph: {
    title: 'Daily English Snap - 毎日届く実用英語フレーズ',
    description: '穴埋めクイズで英語フレーズを楽しく学習！毎日更新される実用フレーズで英会話力アップ。',
    url: 'https://english.news-navi.jp',
    siteName: 'Daily English Snap',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily English Snap - 毎日届く実用英語フレーズ',
    description: '穴埋めクイズで英語フレーズを楽しく学習！毎日更新される実用フレーズで英会話力アップ。',
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
        {/* PWA対応 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffed4e" />
        {/* iOS対応 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="英語Snap" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5844879039024261"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Service Worker登録 */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('ServiceWorker registered');
                })
                .catch(function(error) {
                  console.log('ServiceWorker registration failed:', error);
                });
            }
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-[#fafaf9]">
          <Header />

          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>

          <footer className="bg-white border-t border-stone-200 mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-sm">
              <div className="flex justify-center gap-4 mb-2">
                <Link href="/privacy" className="text-stone-500 hover:text-[#eab308] transition-colors">
                  プライバシーポリシー
                </Link>
              </div>
              <p className="text-[#eab308]">© 2026 Daily English Snap. Powered by E-edu</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
