import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  try {
    // Mover a inicialização do Stripe para dentro da função
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    let accountId = profile.stripe_account_id

    // Se não tem conta Stripe, criar uma nova
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: user.email,
        business_profile: {
          name: profile.business_name,
        },
      })

      accountId = account.id

      // Salvar o account_id no banco
      await supabase.from("profiles").update({ stripe_account_id: accountId }).eq("id", user.id)
    }

    // Criar link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin?stripe_success=true`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error("Stripe Connect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
