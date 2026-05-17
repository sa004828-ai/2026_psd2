// app/login/page.tsx
import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form className="flex flex-col gap-4 p-8 bg-white border rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">クレーンゲームレビュー</h1>
        <p className="text-sm text-center text-gray-500 mb-4">ログインまたは新規登録をしてください</p>

        <input
          name="email"
          type="email"
          placeholder="メールアドレス"
          required
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <input
          name="password"
          type="password"
          placeholder="パスワード"
          required
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />

        {/* formAction属性を使って、ボタンが押されたときにサーバーの関数を呼び出す */}
        <button
          formAction={login}
          className="p-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
        >
          ログイン
        </button>
        <button
          formAction={signup}
          className="p-2 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition"
        >
          新規アカウント作成
        </button>
      </form>
    </div>
  );
}