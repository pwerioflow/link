import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  try {
    // Verificações básicas
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY not configured" }, { status: 500 })
    }

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

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found", details: profileError?.message }, { status: 404 })
    }

    let accountId = profile.stripe_account_id

    // Se não tem conta Stripe, criar uma nova
    if (!accountId) {
      try {
        console.log("Creating Stripe account for user:", user.id)
        console.log("User email:", user.email)
        console.log("Business name:", profile.business_name)

        const accountData = {
          type: "express" as const,
          country: "BR",
          email: user.email || undefined,
          business_profile: {
            name: profile.business_name || "Meu Negócio",
          },
        }

        console.log("Account data:", JSON.stringify(accountData, null, 2))

        const account = await stripe.accounts.create(accountData)

        console.log("Stripe account created:", account.id)
        accountId = account.id

        // Salvar o account_id no banco
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ stripe_account_id: accountId })
          .eq("id", user.id)

        if (updateError) {
          console.error("Database update error:", updateError)
          return NextResponse.json(
            { error: "Failed to save Stripe account", details: updateError.message },
            { status: 500 },
          )
        }

        console.log("Stripe account ID saved to database")
      } catch (stripeError: any) {
        console.error("Stripe account creation error:", {
          message: stripeError.message,
          type: stripeError.type,
          code: stripeError.code,
          param: stripeError.param,
          decline_code: stripeError.decline_code,
          request_id: stripeError.request_id,
        })

        // Retornar erro mais detalhado
        return NextResponse.json(
          {
            error: "Failed to create Stripe account",
            details: stripeError.message,
            type: stripeError.type,
            code: stripeError.code,
            param: stripeError.param,
            stripe_error: {
              message: stripeError.message,
              type: stripeError.type,
              code: stripeError.code,
              decline_code: stripeError.decline_code,
              param: stripeError.param,
            },
          },
          { status: 500 },
        )
      }
    }

    // Criar link de onboarding
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${siteUrl}/admin?stripe_refresh=true`,
        return_url: `${siteUrl}/admin?stripe_success=true`,
        type: "account_onboarding",
      })

      console.log("Account link created successfully")
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
    console.error("General Stripe Connect error:", error)
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
