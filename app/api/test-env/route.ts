import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    stripe_secret_key: process.env.STRIPE_SECRET_KEY ? "✅ Configurada" : "❌ Não encontrada",
    stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY ? "✅ Configurada" : "❌ Não encontrada",
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET ? "✅ Configurada" : "❌ Não encontrada",
    site_url: process.env.NEXT_PUBLIC_SITE_URL || "❌ Não encontrada",
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurada" : "❌ Não encontrada",
    supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ Não encontrada",
  })
}
