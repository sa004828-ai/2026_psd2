// app/reviews/new/actions.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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

  // 1. ログインユーザーの取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('ログインが必要です')
  }

  // 2. フォームから値を取得
  const title = formData.get('title') as string
  const item_name = formData.get('item_name') as string
  const item_category = formData.get('item_category') as string
  const store_name = formData.get('store_name') as string
  const cost = parseInt(formData.get('cost') as string, 10)
  
  // 🔒 公開設定の値を取得して Boolean型 (true/false) に変換
  const isPublicRaw = formData.get('is_public') as string
  const is_public = isPublicRaw === 'true'
  
  // 画像ファイルの取得
  const imageFile = formData.get('image') as File | null
  
  // デフォルトのダミー画像URL
  let imageUrl = 'https://placehold.co/600x400?text=No+Image'

  // 3. 画像が選択されていれば Supabase Storage にアップロード
  if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
    
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      console.error('許可されていないファイル形式です:', fileExt)
      return redirect('/reviews/new?error=invalid_file_type')
    }

    const fileName = `${user.id}_${Date.now()}.${fileExt}`

    const { data: storageData, error: storageError } = await supabase.storage
      .from('review-images')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
      })

    if (storageError) {
      console.error('画像アップロードエラー:', storageError.message)
      return redirect('/reviews/new?error=image_upload_failed')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('review-images')
      .getPublicUrl(fileName)
      
    imageUrl = publicUrl
  }

  // 4. データベース（reviewsテーブル）に保存
  const { error: dbError } = await supabase
    .from('reviews')
    .insert([
      {
        user_id: user.id,
        title,
        item_name,
        item_category,
        store_name,
        cost,
        item_image_url: imageUrl,
        is_public, // 🔒 ここで判定された true/false を保存します
      },
    ])

  if (dbError) {
    console.error('DB保存エラー:', dbError.message)
    return redirect('/reviews/new?error=save_failed')
  }

  return redirect('/')
}