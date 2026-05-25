// app/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { logout } from './login/actions'

export default async function Home() {
  const cookieStore = await cookies()

  // Supabaseクライアントの初期化
  const supabase = createServerClient(
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

  // 1. ログインしているユーザーの情報を取得
  const { data: { user } } = await supabase.auth.getUser()

  // 2. reviewsテーブルからデータを全件取得（作成日時の新しい順：desc）
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('データ取得エラー:', error.message)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* ヘッダーエリア */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">クレーンゲームレビュー</h1>
            <p className="text-gray-500 text-sm mt-1">みんなの獲得攻略プロトタイプ</p>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email} さん</span>
              <form action={logout}>
                <button className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300 transition">
                  ログアウト
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              ログイン / 新規登録
            </Link>
          )}
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 左側：ナビゲーション・アクションボタン */}
          <div className="md:col-span-1">
            {user && (
              <Link 
                href="/reviews/new" 
                className="block w-full text-center bg-blue-500 text-white font-bold px-4 py-3 rounded-lg shadow hover:bg-blue-600 transition"
              >
                ＋ 新規レビューを投稿
              </Link>
            )}
            <div className="bg-white p-4 rounded-lg shadow mt-4 text-sm text-gray-500">
              <p>💡 公開リポジトリでのプロトタイプ開発中。学生に見せる用の画面です。</p>
            </div>
          </div>
          
          {/* 右側：レビュー一覧表示 */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-700">最新のレビュー一覧</h2>
            
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex gap-4 items-start">
                  
                  {/* 📷 左側：固定サイズのサムネイル画像エリア */}
                  {review.item_image_url && (
                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 relative">
                      <img 
                        src={review.item_image_url} 
                        alt={review.item_name} 
                        className="w-full h-full object-cover rounded-md bg-gray-100 border"
                      />
                    </div>
                  )}

                  {/* 📝 右側：テキスト情報エリア */}
                  <div className="flex-grow flex flex-col justify-between h-full min-h-[96px] md:min-h-[128px]">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800 leading-snug line-clamp-1">{review.title}</h3>
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded flex-shrink-0">
                          {review.item_category || 'その他'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                        <p className="truncate">📦 <span className="font-semibold text-gray-500">景品:</span> {review.item_name}</p>
                        <p className="truncate">🏢 <span className="font-semibold text-gray-500">店舗:</span> {review.store_name}</p>
                      </div>
                    </div>

                    {/* 下部の金額と日付 */}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 text-sm">
                      <p className="text-gray-700">
                        投資: <span className="text-red-500 font-bold text-base">{review.cost.toLocaleString()}円</span>
                      </p>
                      <p className="text-gray-400 text-xs">
                        📅 {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <p className="text-gray-500 bg-white p-8 rounded-lg shadow text-center">
                まだレビューが投稿されていません。
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}