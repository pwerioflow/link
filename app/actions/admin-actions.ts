"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function resetQrScanCount(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("qr_code_metrics")
    .update({ scan_count: 0, last_scanned_at: null })
    .eq("user_id", userId)

  if (error) {
    console.error("Error resetting QR scan count:", error)
    return { success: false, message: "Erro ao redefinir contador." }
  }

  revalidatePath("/admin") // Revalida a página admin para mostrar o novo valor
  return { success: true, message: "Contador de QR code redefinido com sucesso!" }
}
