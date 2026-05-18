// app/reviews/new/page.tsx
import { createReview } from './actions'

export default function NewReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">新規レビュー投稿テスト</h1>
        
        <form action={createReview} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">レビュータイトル</label>
            <input name="title" type="text" required className="w-full p-2 border rounded" placeholder="最高の設定でした！" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">景品名</label>
            <input name="item_name" type="text" required className="w-full p-2 border rounded" placeholder="初音ミク フィギュア" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">景品の種別</label>
            <input name="item_category" type="text" className="w-full p-2 border rounded" placeholder="フィギュア" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">獲得店舗名</label>
            <input name="store_name" type="text" required className="w-full p-2 border rounded" placeholder="タイトーステーション 新宿店" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">かかった費用（円）</label>
            <input name="cost" type="number" required min="0" className="w-full p-2 border rounded" placeholder="1500" />
          </div>

          <button type="submit" className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition mt-4">
            レビューを送信する
          </button>
        </form>
      </div>
    </div>
  )
}