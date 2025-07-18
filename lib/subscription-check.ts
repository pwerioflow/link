import { createClient } from "@/lib/supabase/server"

export async function checkSubscriptionStatus(userId: string) {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, trial_end")
    .eq("user_id", userId)
    .single()

  if (!subscription) {
    return { hasAccess: false, reason: "no_subscription" }
  }

  const now = new Date()

  // Verificar se está em trial
  if (subscription.trial_end && new Date(subscription.trial_end) > now) {
    return { hasAccess: true, reason: "trial", subscription }
  }

  // Verificar se assinatura está ativa
  if (subscription.status === "active") {
    return { hasAccess: true, reason: "active", subscription }
  }

  return { hasAccess: false, reason: "expired", subscription }
}
