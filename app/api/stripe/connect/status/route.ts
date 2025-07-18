import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("stripe_account_id").eq("id", user.id).single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        onboarding_complete: false,
        charges_enabled: false,
        payouts_enabled: false,
      })
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id)

    const status = {
      connected: true,
      onboarding_complete: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    }

    // Atualizar status no banco
    await supabase
      .from("profiles")
      .update({
        stripe_onboarding_complete: status.onboarding_complete,
        stripe_charges_enabled: status.charges_enabled,
        stripe_payouts_enabled: status.payouts_enabled,
      })
      .eq("id", user.id)

    return NextResponse.json(status)
  } catch (error) {
    console.error("Stripe status check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
