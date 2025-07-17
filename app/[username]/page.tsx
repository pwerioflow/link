import { createClient } from "@/lib/supabase/server"
import { Instagram, Mail, Globe, Download, MessageCircle } from "lucide-react"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { incrementQrScanCount } from "@/lib/supabase/qr-tracking"
import Link from "next/link"

import ClientLinkButton from "./client-link-button"

const iconMap = {
  instagram: <Instagram />,
  email: <Mail />,
  website: <Globe />,
  download: <Download />,
  whatsapp: <MessageCircle />,
}

export default async function UserLinktreePage({
  params,
  searchParams,
}: {
  params: { username: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  if (params.username === "demo") {
    redirect("/demo")
  }

  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("username", params.username).single()

  if (!profile) {
    notFound()
  }

  const { data: settings } = await supabase.from("settings").select("*").eq("id", profile.id).single()

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("order_index")

  if (searchParams.source === "qr") {
    await incrementQrScanCount(profile.id)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Logo do Empreendimento */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {profile.business_logo_url ? (
              <Image
                src={profile.business_logo_url || "/placeholder.svg"}
                alt="Logo do Empreendimento"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📷</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{profile.business_name}</h1>
          <p className="text-gray-600 text-sm">{profile.business_description}</p>
        </div>

        {/* Links */}
        <div className="space-y-4 mb-12">
          {links?.map((link) => (
            <ClientLinkButton key={link.id} link={link} settings={settings} icon={iconMap[link.icon_type]} />
          ))}
        </div>

        {/* Rodapé com Pwer Io */}
        <div className="text-center pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Desenvolvido por{" "}
            <Link href="https://www.pwer.com.br" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Pwer Io
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
