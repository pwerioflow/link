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

    const { data: profile } = await supabase.from("profiles").select("stripe_account_id").eq("id", user.id).single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ error: "No Stripe account found" }, { status: 404 })
    }

    const accountLink = await stripe.accountLinks.create({
      account: profile.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin?stripe_success=true`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error("Stripe Connect refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
