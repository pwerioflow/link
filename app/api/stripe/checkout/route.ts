import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  try {
    // Mover a inicialização do Stripe para dentro da função
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    })

    const { items, username } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar perfil do vendedor pelo username
    const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

    if (!profile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }

    if (!profile.stripe_account_id || !profile.stripe_charges_enabled) {
      return NextResponse.json({ error: "Seller not configured for payments" }, { status: 400 })
    }

    // Verificar se o vendedor tem assinatura ativa
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, trial_end")
      .eq("user_id", profile.id)
      .single()

    const now = new Date()
    const isTrialActive = subscription?.trial_end && new Date(subscription.trial_end) > now
    const isSubscriptionActive = subscription?.status === "active"

    if (!isTrialActive && !isSubscriptionActive) {
      return NextResponse.json({ error: "Seller subscription is not active" }, { status: 400 })
    }

    // Buscar produtos para validar preços
    const productIds = items.map((item: any) => item.product.id)
    const { data: products } = await supabase.from("products").select("*").in("id", productIds)

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: "Some products not found" }, { status: 404 })
    }

    // Criar line items para o Stripe
    const lineItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.product.id)
      if (!product) throw new Error("Product not found")

      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: Math.round(product.price * 100), // Converter para centavos
        },
        quantity: item.quantity,
      }
    })

    // Criar sessão de checkout (SEM taxa da plataforma - 100% vai para o vendedor)
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card", "pix"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${username}?checkout=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${username}?checkout=cancel`,
        metadata: {
          seller_id: profile.id,
          seller_username: username,
        },
        // REMOVIDO: payment_intent_data com application_fee_amount
        // Agora 100% vai para o vendedor
      },
      {
        stripeAccount: profile.stripe_account_id,
      },
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
