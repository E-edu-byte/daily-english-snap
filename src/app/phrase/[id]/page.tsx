import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PhraseCard from '@/app/components/PhraseCard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 3600 // 1時間ごとに再検証

async function getPhrase(id: string) {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const phrase = await getPhrase(params.id)

  if (!phrase) {
    return {
      title: 'フレーズが見つかりません - Daily English Snap',
    }
  }

  return {
    title: `${phrase.phrase} - Daily English Snap`,
    description: `${phrase.meaning} | ${phrase.nuance.slice(0, 100)}...`,
  }
}

export default async function PhrasePage({ params }: { params: { id: string } }) {
  const phrase = await getPhrase(params.id)

  if (!phrase) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary hover:underline mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        ホームに戻る
      </Link>

      <PhraseCard phrase={phrase} />
    </div>
  )
}
