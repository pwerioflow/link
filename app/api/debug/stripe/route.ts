import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar todas as variáveis necessárias
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment_variables: {
        STRIPE_SECRET_KEY: {
          exists: !!process.env.STRIPE_SECRET_KEY,
          starts_with_sk: process.env.STRIPE_SECRET_KEY?.startsWith("sk_") || false,
          length: process.env.STRIPE_SECRET_KEY?.length || 0,
          preview: process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 8)}...` : "Not found",
        },
        STRIPE_PUBLISHABLE_KEY: {
          exists: !!process.env.STRIPE_PUBLISHABLE_KEY,
          starts_with_pk: process.env.STRIPE_PUBLISHABLE_KEY?.startsWith("pk_") || false,
          length: process.env.STRIPE_PUBLISHABLE_KEY?.length || 0,
          preview: process.env.STRIPE_PUBLISHABLE_KEY
            ? `${process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 8)}...`
            : "Not found",
        },
        STRIPE_WEBHOOK_SECRET: {
          exists: !!process.env.STRIPE_WEBHOOK_SECRET,
          starts_with_whsec: process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_") || false,
          length: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
          preview: process.env.STRIPE_WEBHOOK_SECRET
            ? `${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...`
            : "Not found",
        },
        NEXT_PUBLIC_SITE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SITE_URL,
          value: process.env.NEXT_PUBLIC_SITE_URL || "Not found",
        },
        NEXT_PUBLIC_SUPABASE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          preview: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...`
            : "Not found",
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          preview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
            : "Not found",
        },
      },
    }

    // Teste básico do Stripe
    let stripe_test = null
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const Stripe = require("stripe")
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2024-06-20",
        })

        // Teste simples - listar produtos (não cria nada)
        await stripe.products.list({ limit: 1 })
        stripe_test = { status: "success", message: "Stripe connection successful" }
      } else {
        stripe_test = { status: "error", message: "STRIPE_SECRET_KEY not found" }
      }
    } catch (error: any) {
      stripe_test = {
        status: "error",
        message: error.message,
        type: error.type || "unknown",
      }
    }

    return NextResponse.json({
      ...diagnostics,
      stripe_connection_test: stripe_test,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
