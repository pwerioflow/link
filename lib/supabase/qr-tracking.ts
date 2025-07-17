import { createClient } from "@/lib/supabase/server"

export async function incrementQrScanCount(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("qr_code_metrics")
    .update({ scan_count: (prev: number) => prev + 1, last_scanned_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()

  if (error) {
    console.error("Error incrementing QR scan count:", error)
    return { success: false, error: error.message }
  }
  return { success: true, data }
}
