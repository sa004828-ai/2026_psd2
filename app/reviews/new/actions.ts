// app/reviews/new/actions.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Supabaseクライアント初期化ヘルパー
async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )
}

export async function createReview(formData: FormData) {
  const supabase = await getSupabase()

  // 1. 現在ログインしているユーザーの情報を取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('ログインが必要です')
  }

  // 2. フォームから入力値を取得
  const title = formData.get('title') as string
  const item_name = formData.get('item_name') as string
  const item_category = formData.get('item_category') as string
  const store_name = formData.get('store_name') as string
  const cost = parseInt(formData.get('cost') as string, 10)

  // 3. データベース（reviewsテーブル）に保存
  const { error } = await supabase
    .from('reviews')
    .insert([
      {
        user_id: user.id, // ログインユーザーのID
        title,
        item_name,
        item_category,
        store_name,
        cost,
        item_image_url: 'https://placehold.co/600x400?text=No+Image', // 一旦ダミーURL
        is_public: true,
      },
    ])

  if (error) {
    console.error('DB保存エラー:', error.message)
    return redirect('/reviews/new?error=save_failed')
  }

  // 4. 保存に成功したらトップページへ戻る
  return redirect('/')
}