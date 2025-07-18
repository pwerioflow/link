import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  try {
    // Verificar se a chave do Stripe existe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY not found in environment variables")
      return NextResponse.json(
        {
          error: "Stripe configuration missing",
          details: "STRIPE_SECRET_KEY not configured",
        },
        { status: 500 },
      )
    }

    // Verificar se a chave tem o formato correto
    if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
      console.error("STRIPE_SECRET_KEY has invalid format")
      return NextResponse.json(
        {
          error: "Invalid Stripe key format",
          details: "STRIPE_SECRET_KEY should start with 'sk_'",
        },
        { status: 500 },
      )
    }

    // Inicializar Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json(
        {
          error: "Profile not found",
          details: profileError.message,
        },
        { status: 404 },
      )
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    let accountId = profile.stripe_account_id

    // Se não tem conta Stripe, criar uma nova
    if (!accountId) {
      try {
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
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ stripe_account_id: accountId })
          .eq("id", user.id)

        if (updateError) {
          console.error("Database update error:", updateError)
          return NextResponse.json(
            {
              error: "Failed to save Stripe account",
              details: updateError.message,
            },
            { status: 500 },
          )
        }
      } catch (stripeError: any) {
        console.error("Stripe account creation error:", stripeError)
        return NextResponse.json(
          {
            error: "Failed to create Stripe account",
            details: stripeError.message,
            type: stripeError.type,
          },
          { status: 500 },
        )
      }
    }

    // Verificar NEXT_PUBLIC_SITE_URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    try {
      // Criar link de onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${siteUrl}/admin?stripe_refresh=true`,
        return_url: `${siteUrl}/admin?stripe_success=true`,
        type: "account_onboarding",
      })

      return NextResponse.json({ url: accountLink.url })
    } catch (linkError: any) {
      console.error("Account link creation error:", linkError)
      return NextResponse.json(
        {
          error: "Failed to create onboarding link",
          details: linkError.message,
          type: linkError.type,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Stripe Connect error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
