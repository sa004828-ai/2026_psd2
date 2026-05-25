// app/login/actions.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Supabaseクライアントの初期化（非同期対応版）
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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentから呼び出された場合は無視
          }
        },
      },
    }
  )
}

// サインアップ（新規登録）処理
export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await getSupabase()

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    console.error('Signup error:', error.message)
    return redirect('/login?error=signup_failed')
  }

  return redirect('/')
}

// ログイン処理
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await getSupabase()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Login error:', error.message)
    return redirect('/login?error=login_failed')
  }

  return redirect('/')
}

// ログアウト処理
export async function logout() {
  const supabase = await getSupabase()
  await supabase.auth.signOut()
  return redirect('/')
}