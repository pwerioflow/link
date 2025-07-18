import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    // Verificar se as chaves existem
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY not found" })
    }

    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json({ error: "STRIPE_PUBLISHABLE_KEY not found" })
    }

    // Inicializar Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })

    // Teste 1: Verificar se a chave funciona
    let stripeKeyTest = null
    try {
      const balance = await stripe.balance.retrieve()
      stripeKeyTest = {
        status: "success",
        message: "Stripe key is valid",
        currency: balance.available[0]?.currency || "unknown",
      }
    } catch (error: any) {
      stripeKeyTest = {
        status: "error",
        message: error.message,
        type: error.type,
        code: error.code,
      }
    }

    // Teste 2: Verificar se consegue criar uma conta de teste
    let accountCreationTest = null
    try {
      // Tentar criar uma conta de teste simples
      const testAccount = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: "test@example.com",
        business_profile: {
          name: "Test Business",
        },
      })

      // Se criou com sucesso, deletar imediatamente
      await stripe.accounts.del(testAccount.id)

      accountCreationTest = {
        status: "success",
        message: "Account creation works",
      }
    } catch (error: any) {
      accountCreationTest = {
        status: "error",
        message: error.message,
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        param: error.param,
      }
    }

    // Teste 3: Verificar configuração da conta Stripe
    let accountInfo = null
    try {
      const account = await stripe.accounts.retrieve()
      accountInfo = {
        id: account.id,
        country: account.country,
        default_currency: account.default_currency,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        type: account.type,
      }
    } catch (error: any) {
      accountInfo = {
        error: error.message,
        type: error.type,
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      stripe_key_test: stripeKeyTest,
      account_creation_test: accountCreationTest,
      account_info: accountInfo,
      environment: {
        node_env: process.env.NODE_ENV,
        site_url: process.env.NEXT_PUBLIC_SITE_URL,
        stripe_key_preview: process.env.STRIPE_SECRET_KEY.substring(0, 12) + "...",
        stripe_key_type: process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")
          ? "test"
          : process.env.STRIPE_SECRET_KEY.startsWith("sk_live_")
            ? "live"
            : "unknown",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
