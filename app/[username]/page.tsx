import { createClient } from "@/lib/supabase/server"
import { Instagram, Mail, Globe, Download, MessageCircle, Play } from "lucide-react"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { incrementQrScanCount } from "@/lib/supabase/qr-tracking"
import Link from "next/link"
import type { Metadata } from "next"

import ClientLinkButton from "./client-link-button"
import { CartProvider } from "@/lib/context/cart-context"
import { CartButton } from "@/components/cart/cart-button"
import { CartDrawer } from "@/components/cart/cart-drawer"
import ProductCard from "./product-card"
import VideoLinkButton from "./video-link-button"

const iconMap = {
  instagram: <Instagram />,
  email: <Mail />,
  website: <Globe />,
  download: <Download />,
  whatsapp: <MessageCircle />,
  video: <Play />,
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("username", params.username).single()

  if (!profile) {
    return {
      title: "Página não encontrada",
      description: "A página que você está procurando não existe.",
    }
  }

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  const pageUrl = `${baseUrl}/${params.username}`

  return {
    title: profile.business_name || "Linktree",
    description: profile.business_description || "Seu link único. Todas as conexões.",
    openGraph: {
      url: pageUrl,
      type: "website",
      title: profile.business_name || "Linktree",
      description: profile.business_description || "Seu link único. Todas as conexões.",
    },
    twitter: {
      card: "summary_large_image",
      title: profile.business_name || "Linktree",
      description: profile.business_description || "Seu link único. Todas as conexões.",
    },
  }
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

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("order_index")

  if (searchParams.source === "qr") {
    await incrementQrScanCount(profile.id)
  }

  // Verificar parâmetros de checkout
  const checkoutSuccess = searchParams.checkout === "success"
  const checkoutCancel = searchParams.checkout === "cancel"

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        {/* Hero Banner */}
        {profile.hero_banner_url && (
          <div className="w-full h-48 md:h-64 lg:h-80 relative mb-8">
            <Image
              src={profile.hero_banner_url || "/placeholder.svg"}
              alt="Hero Banner"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

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

          {/* Mensagens de Checkout */}
          {checkoutSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <span className="text-xl">✅</span>
                <div>
                  <h3 className="font-semibold">Pagamento realizado com sucesso!</h3>
                  <p className="text-sm">Obrigado pela sua compra. Você receberá um email de confirmação em breve.</p>
                </div>
              </div>
            </div>
          )}

          {checkoutCancel && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="text-xl">⚠️</span>
                <div>
                  <h3 className="font-semibold">Pagamento cancelado</h3>
                  <p className="text-sm">Sua compra foi cancelada. Os itens ainda estão no seu carrinho.</p>
                </div>
              </div>
            </div>
          )}

          {/* Produtos */}
          {products && products.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Produtos</h2>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="space-y-4 mb-12">
            {links?.map((link) =>
              link.type === "video" ? (
                <VideoLinkButton key={link.id} link={link} settings={settings} />
              ) : (
                <ClientLinkButton key={link.id} link={link} settings={settings} icon={iconMap[link.icon_type]} />
              ),
            )}
          </div>

          {/* Rodapé com Pwer Io */}
          <div className="text-center pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Desenvolvido por{" "}
              <Link
                href="https://www.pwer.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Pwer Io
              </Link>
            </p>
          </div>
        </div>

        {/* Carrinho flutuante e drawer */}
        <CartButton />
        <CartDrawer />
      </div>
    </CartProvider>
  )
}
