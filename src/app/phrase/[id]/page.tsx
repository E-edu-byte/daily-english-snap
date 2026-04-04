import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PhraseCard from '@/app/components/PhraseCard'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export const revalidate = 3600 // 1時間ごとに再検証

async function getPhrase(id: string) {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    blankWord: data.blank_word
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const phrase = await getPhrase(id)

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

export default async function PhrasePage({ params }: PageProps) {
  const { id } = await params
  const phrase = await getPhrase(id)

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
