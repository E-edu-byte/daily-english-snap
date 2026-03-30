import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'プライバシーポリシー - Daily English Snap',
  description: 'Daily English Snapのプライバシーポリシーについて',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#eab308] hover:text-[#ca8a04] transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        ホームに戻る
      </Link>

      <article className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8">
          プライバシーポリシー
        </h1>

        <div className="prose prose-stone max-w-none space-y-8 text-stone-700">
          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">はじめに</h2>
            <p>
              Daily English Snap（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
              本プライバシーポリシーでは、当サイトがどのような情報を収集し、どのように利用するかについて説明します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">収集する情報</h2>
            <p>当サイトでは、以下の情報を収集することがあります。</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
              <li>Cookieによる閲覧履歴</li>
              <li>ローカルストレージに保存される学習記録（お使いの端末にのみ保存されます）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">Cookieの使用について</h2>
            <p>
              当サイトでは、ユーザー体験の向上および広告配信のためにCookieを使用しています。
              Cookieはブラウザの設定により無効にすることができますが、一部の機能が利用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">広告について</h2>
            <p>
              当サイトでは、第三者配信の広告サービス「Google AdSense」を利用しています。
              広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
            </p>
            <p className="mt-2">
              Google AdSenseの詳細については、
              <a
                href="https://policies.google.com/technologies/ads?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#eab308] hover:underline"
              >
                Googleの広告に関するポリシー
              </a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">アクセス解析について</h2>
            <p>
              当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用する場合があります。
              このツールはトラフィックデータの収集のためにCookieを使用しています。
              このデータは匿名で収集されており、個人を特定するものではありません。
            </p>
            <p className="mt-2">
              詳細については、
              <a
                href="https://policies.google.com/privacy?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#eab308] hover:underline"
              >
                Googleのプライバシーポリシー
              </a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">個人情報の第三者提供</h2>
            <p>
              当サイトは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">プライバシーポリシーの変更</h2>
            <p>
              当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
              変更後のプライバシーポリシーは、当ページに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">お問い合わせ</h2>
            <p>
              本ポリシーに関するお問い合わせは、サイト運営者までご連絡ください。
            </p>
          </section>

          <p className="text-sm text-stone-500 mt-8 pt-4 border-t border-stone-200">
            制定日：2026年3月30日
          </p>
        </div>
      </article>
    </div>
  )
}
