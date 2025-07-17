import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Se o usuário estiver logado, busca o username
    const { data: profile, error } = await supabase.from("profiles").select("username").eq("id", user.id).single()

    if (error || !profile || !profile.username) {
      // Se não tiver username, redireciona para o admin para definir
      redirect("/admin")
    } else {
      // Se tiver username, redireciona para a página do Linktree dele
      redirect(`/${profile.username}`)
    }
  } else {
    // Se não estiver logado, redireciona para a página de demonstração
    redirect("/demo")
  }

  return null
}
