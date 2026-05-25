// app/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { logout } from './login/actions'

interface Props {
  searchParams: Promise<{ query?: string; category?: string }>
}

export default async function Home({ searchParams }: Props) {
  const cookieStore = await cookies()
  
  // URLのパラメータから検索ワード（?query=xxx）を取得
  const resolvedSearchParams = await searchParams
  const searchQuery = resolvedSearchParams.query || ''
  const searchCategory = resolvedSearchParams.category || ''

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

  // 2. クエリの土台を作成
  let query = supabase
    .from('reviews')
    .select('*')
  
  // 3. ログイン状態に応じて公開・非公開の表示条件を分岐
  if (user) {
    query = query.or(`is_public.eq.true, user_id.eq.${user.id}`)
  } else {
    query = query.filter('is_public', 'eq', true)
  }

  // 🔍 4. 検索ワードがある場合、景品名(item_name) または 店舗名(store_name) であいまい検索
  if (searchQuery) {
    // textSearchやorを組み合わせて、どちらかにヒットすればOKという条件にします
    query = query.or(`item_name.ilike.%${searchQuery}%,store_name.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`)
  }

  if (searchCategory && searchCategory !== 'すべて') {
    query = query.eq('item_category', searchCategory)
  }
  // 5. 新しい順に並び替えて実行
  const { data: reviews, error } = await query.order('created_at', { ascending: false })

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
          
          {/* 左側：ナビゲーション・アクションボタン ＆ 検索窓 */}
          <div className="md:col-span-1 flex flex-col gap-4">
            {user && (
              <Link 
                href="/reviews/new" 
                className="block w-full text-center bg-blue-500 text-white font-bold px-4 py-3 rounded-lg shadow hover:bg-blue-600 transition"
              >
                ＋ 新規レビューを投稿
              </Link>
            )}

            {/* 🔍 検索フォーム */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-2">レビューを検索</h3>
              <form method="GET" action="/" className="flex flex-col gap-2">
                <input 
                  type="text" 
                  name="query" 
                  defaultValue={searchQuery}
                  placeholder="レビュー、景品、店舗で検索" 
                  className="w-full p-2 border rounded text-sm"
                />
                <select 
                  name="category" 
                  defaultValue={searchCategory}
                  className="w-full p-2 border rounded text-sm bg-white"
                >
                  <option value="すべて">すべてのカテゴリ</option>
                  <option value="その他">その他</option>
                  <option value="フィギュア">フィギュア</option>
                  <option value="ぬいぐるみ（大）">ぬいぐるみ（大）</option>
                  <option value="ぬいぐるみ（中）">ぬいぐるみ（中）</option>
                  <option value="ぬいぐるみ（小）">ぬいぐるみ（小）</option>
                  <option value="アクリルグッズ">アクリルグッズ</option>
                  <option value="缶バッジ">缶バッジ</option>
                  <option value="日用品">日用品</option>
                  <option value="お菓子">お菓子</option>
                  <option value="おもちゃ">おもちゃ</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="flex-grow bg-gray-800 text-white text-sm font-bold p-2 rounded hover:bg-gray-700 transition">
                    検索
                  </button>
                  {searchQuery && (
                    <Link href="/" className="bg-gray-200 text-gray-700 text-sm p-2 rounded hover:bg-gray-300 transition text-center px-3">
                      クリア
                    </Link>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white p-4 rounded-lg shadow text-sm text-gray-500">
              <p>💡 公開リポジトリでのプロトタイプ開発中。学生に見せる用の画面です。</p>
            </div>
          </div>
          
          {/* 右側：レビュー一覧表示 */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700">最新のレビュー一覧</h2>
              {searchQuery && (
                <span className="text-sm bg-gray-200 px-2 py-1 rounded text-gray-600">
                  「{searchQuery}」の検索結果: {reviews?.length || 0}件
                </span>
              )}
            </div>
            
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
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-800 leading-snug line-clamp-1">{review.title}</h3>
                          {!review.is_public && (
                            <span className="bg-red-50 text-red-600 text-xs px-1.5 py-0.5 rounded border border-red-200 font-medium">
                              非公開
                            </span>
                          )}
                        </div>
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
                該当するレビューが見つかりませんでした。
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}