// app/reviews/new/page.tsx
import { createReview } from './actions'

export default function NewReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">新規レビュー投稿テスト</h1>
        
        {/* ⚠️ 修正：encType="multipart/form-data" を追加 */}
        <form action={createReview} encType="multipart/form-data" className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">レビュータイトル</label>
            <input name="title" type="text" required className="w-full p-2 border rounded" placeholder="最高の設定でした！" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">景品名</label>
            <input name="item_name" type="text" required className="w-full p-2 border rounded" placeholder="初音ミク フィギュア" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">景品写真</label>
            <input name="image" type="file" accept="image/*" className="w-full p-2 border rounded bg-gray-50" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">景品の種別</label>
            <select name="item_category" className="w-full p-2 border rounded bg-white">
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">獲得店舗名</label>
            <input name="store_name" type="text" required className="w-full p-2 border rounded" placeholder="タイトーステーション 新宿店" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">かかった費用（円）</label>
            <input name="cost" type="number" required min="0" className="w-full p-2 border rounded" placeholder="1500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">公開設定</label>
            <select name="is_public" className="w-full p-2 border rounded bg-white">
              <option value="true">全体に公開する</option>
              <option value="false">非公開（自分のみ閲覧可能）</option>
            </select>
          </div>
          
          {/* ⚠️ 修正：余分だった </button> を1つ削除して綺麗に整理 */}
          <button type="submit" className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition mt-4">
            レビューを送信する
          </button>
        </form>
      </div>
    </div>
  )
}