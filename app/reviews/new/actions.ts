// app/reviews/new/actions.ts （1〜3の対策版）
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('ログインが必要です')
  }

  const title = formData.get('title') as string
  const item_name = formData.get('item_name') as string
  const item_category = formData.get('item_category') as string
  const store_name = formData.get('store_name') as string
  const cost = parseInt(formData.get('cost') as string, 10)
  
  // 画像ファイルの取得
  const imageFile = formData.get('image') as File | null
  
  // デフォルトのダミー画像URL
  let imageUrl = 'https://placehold.co/600x400?text=No+Image'

  // 【対策1＆2】画像がちゃんと選択されており、かつサイズが0より大きい場合のみ処理
  if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
    
    // 小文字に統一して拡張子を取得
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase()
    
    // 【対策3】許可する拡張子のリスト（安全対策）
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      console.error('許可されていないファイル形式です:', fileExt)
      return redirect('/reviews/new?error=invalid_file_type')
    }

    // ユニークなファイル名を作成
    const fileName = `${user.id}_${Date.now()}.${fileExt}`

    // Storageへのアップロード
    const { data: storageData, error: storageError } = await supabase.storage
      .from('review-images')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
      })

    if (storageError) {
      console.error('画像アップロードエラー:', storageError.message)
      return redirect('/reviews/new?error=image_upload_failed')
    }

    // 公開URLの取得
    const { data: { publicUrl } } = supabase.storage
      .from('review-images')
      .getPublicUrl(fileName)
      
    imageUrl = publicUrl
  }

  // データベースへ保存
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
        item_image_url: imageUrl, // 画像がない場合はダミーURLが入る
        is_public: true,
      },
    ])

  if (dbError) {
    console.error('DB保存エラー:', dbError.message)
    return redirect('/reviews/new?error=save_failed')
  }

  return redirect('/')
}