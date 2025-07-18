import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
  try {
    // Mover a inicialização do Stripe para dentro da função
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    })

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

    const body = await request.text()
    const sig = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = await createClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription") {
          // Assinatura criada
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscription.id,
              status: "active",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_customer_id", session.customer as string)
        } else {
          // Compra de produto
          console.log("Product purchase completed:", session.id)
          console.log("Seller:", session.metadata?.seller_username)
          console.log("Amount:", session.amount_total)
        }

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id)

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({
              status: "past_due",
            })
            .eq("stripe_subscription_id", invoice.subscription as string)
        }

        break
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account

        // Atualizar status da conta no banco
        await supabase
          .from("profiles")
          .update({
            stripe_onboarding_complete: account.details_submitted,
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
          })
          .eq("stripe_account_id", account.id)

        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
