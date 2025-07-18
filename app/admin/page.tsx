"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Instagram,
  Mail,
  Globe,
  Download,
  MessageCircle,
  Trash2,
  Plus,
  Save,
  Eye,
  LogOut,
  ArrowUp,
  ArrowDown,
  QrCode,
  RotateCcw,
  Package,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/types/database"
import QRCode from "react-qr-code"
import Image from "next/image"

import { resetQrScanCount } from "@/app/actions/admin-actions"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Settings = Database["public"]["Tables"]["settings"]["Row"]
type LinkItem = Database["public"]["Tables"]["links"]["Row"]
type ProductItem = Database["public"]["Tables"]["products"]["Row"]
type QrCodeMetrics = Database["public"]["Tables"]["qr_code_metrics"]["Row"]

const iconMap = {
  instagram: <Instagram />,
  email: <Mail />,
  website: <Globe />,
  download: <Download />,
  whatsapp: <MessageCircle />,
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [qrMetrics, setQrMetrics] = useState<QrCodeMetrics | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [landingPageUrl, setLandingPageUrl] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [stripeStatus, setStripeStatus] = useState({
    connected: false,
    onboarding_complete: false,
    charges_enabled: false,
    payouts_enabled: false,
  })
  const [stripeLoading, setStripeLoading] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    if (user && profile?.username) {
      setLandingPageUrl(`${window.location.origin}/${profile.username}`)
    } else if (user) {
      setLandingPageUrl("")
    }
  }, [user, profile?.username])

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      await loadUserData(user.id)
    }
    setLoading(false)
  }

  const loadUserData = async (userId: string) => {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single()
    const { data: settingsData } = await supabase.from("settings").select("*").eq("id", userId).single()
    const { data: linksData } = await supabase.from("links").select("*").eq("user_id", userId).order("order_index")
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("order_index")
    const { data: qrMetricsData } = await supabase.from("qr_code_metrics").select("*").eq("user_id", userId).single()
    const { data: subscriptionData } = await supabase.from("subscriptions").select("*").eq("user_id", userId).single()

    setProfile(profileData)
    setSettings(settingsData)
    setLinks(linksData || [])
    setProducts(productsData || [])
    setQrMetrics(qrMetricsData)
    setSubscription(subscriptionData)
  }

  const handleCreateSubscription = async () => {
    setSubscriptionLoading(true)
    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage("Erro ao criar assinatura: " + data.error)
      }
    } catch (error) {
      console.error("Subscription creation error:", error)
      setMessage("Erro ao criar assinatura")
    }
    setSubscriptionLoading(false)
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura?")) return

    setSubscriptionLoading(true)
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setMessage("Assinatura cancelada com sucesso. Você terá acesso até o final do período atual.")
        await loadUserData(user.id)
      } else {
        setMessage("Erro ao cancelar assinatura: " + data.error)
      }
    } catch (error) {
      console.error("Subscription cancellation error:", error)
      setMessage("Erro ao cancelar assinatura")
    }
    setSubscriptionLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return publicUrl
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "business" | "company" | "hero") => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const path = `${user.id}/${type}-${type === "hero" ? "banner" : "logo"}-${Date.now()}`
      const publicUrl = await uploadFile(file, "logos", path)

      const updateData =
        type === "business"
          ? { business_logo_url: publicUrl }
          : type === "company"
            ? { company_logo_url: publicUrl }
            : { hero_banner_url: publicUrl }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

      if (error) throw error

      setProfile((prev) => (prev ? { ...prev, ...updateData } : null))
      setMessage(`${type === "hero" ? "Hero banner" : "Logo"} atualizado com sucesso!`)
    } catch (error) {
      console.error("Error uploading:", error)
      setMessage(`Erro ao fazer upload do ${type === "hero" ? "hero banner" : "logo"}`)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, linkId: string) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const path = `${user.id}/${file.name}-${Date.now()}`
      const publicUrl = await uploadFile(file, "downloads", path)

      setLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, href: publicUrl } : link)))
      setMessage("Arquivo carregado com sucesso!")
    } catch (error) {
      console.error("Error uploading file:", error)
      setMessage("Erro ao fazer upload do arquivo")
    }
  }

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const path = `${user.id}/products/${file.name}-${Date.now()}`
      const publicUrl = await uploadFile(file, "logos", path)

      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? { ...product, image_url: publicUrl } : product)),
      )
      setMessage("Imagem principal do produto carregada com sucesso!")
    } catch (error) {
      console.error("Error uploading product image:", error)
      setMessage("Erro ao fazer upload da imagem do produto")
    }
  }

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0 || !user) return

    const product = products.find((p) => p.id === productId)
    const currentGallery = product?.gallery_images || []

    if (currentGallery.length + files.length > 5) {
      setMessage(`Você pode adicionar no máximo 5 imagens. Atualmente você tem ${currentGallery.length} imagens.`)
      return
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const path = `${user.id}/products/gallery/${file.name}-${Date.now()}`
        return await uploadFile(file, "logos", path)
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newGallery = [...currentGallery, ...uploadedUrls]

      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? { ...product, gallery_images: newGallery } : product)),
      )
      setMessage(`${uploadedUrls.length} imagem(ns) adicionada(s) à galeria!`)
    } catch (error) {
      console.error("Error uploading gallery images:", error)
      setMessage("Erro ao fazer upload das imagens da galeria")
    }
  }

  const removeGalleryImage = (productId: string, imageIndex: number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId && product.gallery_images) {
          const newGallery = [...product.gallery_images]
          newGallery.splice(imageIndex, 1)
          return { ...product, gallery_images: newGallery }
        }
        return product
      }),
    )
  }

  const validateUsername = (username: string) => {
    if (!username) {
      return "O nome de usuário não pode ser vazio."
    }
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return "O nome de usuário deve conter apenas letras minúsculas, números, hífens (-) e underscores (_)."
    }
    if (username.length < 3 || username.length > 20) {
      return "O nome de usuário deve ter entre 3 e 20 caracteres."
    }
    return ""
  }

  const saveData = async () => {
    if (!user || !profile || !settings) return

    const usernameValidation = validateUsername(profile.username || "")
    if (usernameValidation) {
      setUsernameError(usernameValidation)
      return
    }
    setUsernameError("")

    setSaving(true)
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          business_name: profile.business_name,
          business_description: profile.business_description,
          business_logo_url: profile.business_logo_url,
          company_logo_url: profile.company_logo_url,
          hero_banner_url: profile.hero_banner_url,
          username: profile.username,
        })
        .eq("id", user.id)

      if (profileError) {
        if (profileError.code === "23505") {
          setUsernameError("Este nome de usuário já está em uso. Por favor, escolha outro.")
        }
        throw profileError
      }

      const { error: settingsError } = await supabase
        .from("settings")
        .update({
          button_color: settings.button_color,
          button_hover_color: settings.button_hover_color,
          text_color: settings.text_color,
          text_hover_color: settings.text_hover_color,
        })
        .eq("id", user.id)

      if (settingsError) throw settingsError

      // Update links
      for (const link of links) {
        if (link.id.startsWith("temp-")) {
          const { error } = await supabase.from("links").insert({
            user_id: user.id,
            title: link.title,
            subtitle: link.subtitle,
            href: link.href,
            type: link.type,
            icon_type: link.icon_type,
            order_index: link.order_index,
          })
          if (error) throw error
        } else {
          const { error } = await supabase
            .from("links")
            .update({
              title: link.title,
              subtitle: link.subtitle,
              href: link.href,
              type: link.type,
              icon_type: link.icon_type,
              order_index: link.order_index,
            })
            .eq("id", link.id)
          if (error) throw error
        }
      }

      // Update products
      for (const product of products) {
        if (product.id.startsWith("temp-")) {
          const { error } = await supabase.from("products").insert({
            user_id: user.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            display_size: product.display_size,
            stock_quantity: product.stock_quantity,
            gallery_images: product.gallery_images,
            order_index: product.order_index,
          })
          if (error) throw error
        } else {
          const { error } = await supabase
            .from("products")
            .update({
              name: product.name,
              description: product.description,
              price: product.price,
              image_url: product.image_url,
              display_size: product.display_size,
              stock_quantity: product.stock_quantity,
              gallery_images: product.gallery_images,
              order_index: product.order_index,
            })
            .eq("id", product.id)
          if (error) throw error
        }
      }

      setMessage("Dados salvos com sucesso!")
      await loadUserData(user.id)
      router.push(`/${profile.username}`)
    } catch (error) {
      console.error("Error saving data:", error)
      if (!usernameError) {
        setMessage("Erro ao salvar dados")
      }
    }
    setSaving(false)
  }

  const addLink = () => {
    const newLink: LinkItem = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      title: "Novo Link",
      subtitle: "",
      href: "",
      type: "link",
      icon_type: "website",
      order_index: links.length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLinks([...links, newLink])
  }

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      name: "Novo Produto",
      description: "",
      price: 0,
      image_url: null,
      gallery_images: null,
      display_size: "full", // Padrão largura inteira
      stock_quantity: null,
      stripe_price_id: null,
      order_index: products.length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setProducts([...products, newProduct])
  }

  const removeLink = async (id: string) => {
    if (!id.startsWith("temp-")) {
      const { error } = await supabase.from("links").delete().eq("id", id)

      if (error) {
        console.error("Error deleting link:", error)
        return
      }
    }

    setLinks(links.filter((link) => link.id !== id))
  }

  const removeProduct = async (id: string) => {
    if (!id.startsWith("temp-")) {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        console.error("Error deleting product:", error)
        return
      }
    }

    setProducts(products.filter((product) => product.id !== id))
  }

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, ...updates } : link)))
  }

  const updateProduct = (id: string, updates: Partial<ProductItem>) => {
    setProducts(products.map((product) => (product.id === id ? { ...product, ...updates } : product)))
  }

  const moveLink = (id: string, direction: "up" | "down") => {
    const index = links.findIndex((link) => link.id === id)
    if (index === -1) return

    const newLinks = [...links]
    const [movedLink] = newLinks.splice(index, 1)

    if (direction === "up" && index > 0) {
      newLinks.splice(index - 1, 0, movedLink)
    } else if (direction === "down" && index < newLinks.length) {
      newLinks.splice(index + 1, 0, movedLink)
    } else {
      return
    }

    const updatedLinks = newLinks.map((link, idx) => ({
      ...link,
      order_index: idx,
    }))
    setLinks(updatedLinks)
  }

  const moveProduct = (id: string, direction: "up" | "down") => {
    const index = products.findIndex((product) => product.id === id)
    if (index === -1) return

    const newProducts = [...products]
    const [movedProduct] = newProducts.splice(index, 1)

    if (direction === "up" && index > 0) {
      newProducts.splice(index - 1, 0, movedProduct)
    } else if (direction === "down" && index < newProducts.length) {
      newProducts.splice(index + 1, 0, movedProduct)
    } else {
      return
    }

    const updatedProducts = newProducts.map((product, idx) => ({
      ...product,
      order_index: idx,
    }))
    setProducts(updatedProducts)
  }

  const handleResetQrCount = async () => {
    if (!user) return
    const result = await resetQrScanCount(user.id)
    setMessage(result.message)
    if (result.success) {
      await loadUserData(user.id)
    }
  }

  const handleDownloadQrCode = () => {
    if (qrCodeRef.current) {
      const svgElement = qrCodeRef.current.querySelector("svg")
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)

        const downloadLink = document.createElement("a")
        downloadLink.href = svgUrl
        downloadLink.download = `${profile?.username || "pwerlink"}-qrcode.svg`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(svgUrl)
      }
    }
  }

  const checkStripeStatus = async () => {
    try {
      const response = await fetch("/api/stripe/connect/status")
      const status = await response.json()
      setStripeStatus(status)
    } catch (error) {
      console.error("Error checking Stripe status:", error)
    }
  }

  const handleStripeConnect = async () => {
    setStripeLoading(true)
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage("Erro ao conectar com Stripe: " + data.error)
      }
    } catch (error) {
      console.error("Stripe connect error:", error)
      setMessage("Erro ao conectar com Stripe")
    }
    setStripeLoading(false)
  }

  const handleStripeRefresh = async () => {
    setStripeLoading(true)
    try {
      const response = await fetch("/api/stripe/connect/refresh", {
        method: "POST",
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage("Erro ao atualizar Stripe: " + data.error)
      }
    } catch (error) {
      console.error("Stripe refresh error:", error)
      setMessage("Erro ao atualizar Stripe")
    }
    setStripeLoading(false)
  }

  useEffect(() => {
    if (user) {
      checkStripeStatus()
    }
  }, [user])

  // Verificar parâmetros da URL para sucesso/refresh do Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("stripe_success") === "true") {
      setMessage("Conta Stripe conectada com sucesso!")
      checkStripeStatus()
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (urlParams.get("stripe_refresh") === "true") {
      setMessage("Por favor, complete a configuração da sua conta Stripe.")
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const qrCodeUrl = profile?.username ? `${window.location.origin}/${profile.username}?source=qr` : ""

  const removeHeroBanner = async () => {
    if (!user || !profile?.hero_banner_url) return

    try {
      const { error } = await supabase.from("profiles").update({ hero_banner_url: null }).eq("id", user.id)

      if (error) throw error

      setProfile((prev) => (prev ? { ...prev, hero_banner_url: null } : null))
      setMessage("Hero banner removido com sucesso!")
    } catch (error) {
      console.error("Error removing hero banner:", error)
      setMessage("Erro ao remover hero banner")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pwerlink Admin</h1>
            <p className="text-gray-600">Olá, {user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href={profile?.username ? `/${profile.username}` : "#"}>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
                disabled={!profile?.username}
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </Button>
            </Link>
            <Button onClick={saveData} disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {usernameError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{usernameError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gerenciar Links e Produtos</h2>
              <div className="flex gap-2">
                <Button onClick={addLink} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Link
                </Button>
                <Button onClick={addProduct} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Package className="w-4 h-4" />
                  Adicionar Produto
                </Button>
              </div>
            </div>

            {/* Links Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Links</h3>
              {links.map((link, index) => (
                <Card key={link.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveLink(link.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveLink(link.id, "down")}
                          disabled={index === links.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label>Título</Label>
                            <Input
                              value={link.title}
                              onChange={(e) => updateLink(link.id, { title: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Subtítulo</Label>
                            <Input
                              value={link.subtitle || ""}
                              onChange={(e) => updateLink(link.id, { subtitle: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Tipo</Label>
                            <Select
                              value={link.type}
                              onValueChange={(value: any) => updateLink(link.id, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="link">Link</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="download">Download</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Ícone</Label>
                            <Select
                              value={link.icon_type}
                              onValueChange={(value: any) => updateLink(link.id, { icon_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="download">Download</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          {link.type === "download" ? (
                            <div>
                              <Label>Arquivo para Download</Label>
                              <div className="flex gap-2">
                                <Input type="file" onChange={(e) => handleFileUpload(e, link.id)} className="flex-1" />
                                {link.href && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Label>
                                {link.type === "email" ? "Email" : link.type === "whatsapp" ? "Número WhatsApp" : "URL"}
                              </Label>
                              <Input
                                value={link.href}
                                onChange={(e) => updateLink(link.id, { href: e.target.value })}
                                placeholder={
                                  link.type === "email"
                                    ? "exemplo@email.com"
                                    : link.type === "whatsapp"
                                      ? "5511999999999"
                                      : "https://exemplo.com"
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <Button variant="destructive" size="sm" onClick={() => removeLink(link.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Produtos</h3>
              {products.map((product, index) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveProduct(product.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveProduct(product.id, "down")}
                          disabled={index === products.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label>Nome do Produto</Label>
                            <Input
                              value={product.name}
                              onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Preço (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={product.price}
                              onChange={(e) =>
                                updateProduct(product.id, { price: Number.parseFloat(e.target.value) || 0 })
                              }
                            />
                          </div>
                          <div>
                            <Label>Estoque (opcional)</Label>
                            <Input
                              type="number"
                              value={product.stock_quantity || ""}
                              onChange={(e) =>
                                updateProduct(product.id, {
                                  stock_quantity: e.target.value ? Number.parseInt(e.target.value) : null,
                                })
                              }
                              placeholder="Deixe vazio para estoque ilimitado"
                            />
                          </div>
                          <div>
                            <Label>Tamanho do Card</Label>
                            <Select
                              value={product.display_size}
                              onValueChange={(value: "half" | "full") =>
                                updateProduct(product.id, { display_size: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">Largura Inteira</SelectItem>
                                <SelectItem value="half">Meia Página</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Descrição</Label>
                            <Textarea
                              value={product.description || ""}
                              onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <Label>Imagem Principal</Label>
                            <div className="flex gap-2 items-center">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleProductImageUpload(e, product.id)}
                                className="flex-1"
                              />
                              {product.image_url && (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                  <Image
                                    src={product.image_url || "/placeholder.svg"}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label>Galeria de Imagens (máximo 5)</Label>
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleGalleryImageUpload(e, product.id)}
                                className="flex-1"
                                disabled={(product.gallery_images?.length || 0) >= 5}
                              />
                              <p className="text-xs text-gray-500">
                                {product.gallery_images?.length || 0}/5 imagens adicionadas
                              </p>

                              {/* Preview das imagens da galeria */}
                              {product.gallery_images && product.gallery_images.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                  {product.gallery_images.map((imageUrl, index) => (
                                    <div
                                      key={index}
                                      className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden"
                                    >
                                      <Image
                                        src={imageUrl || "/placeholder.svg"}
                                        alt={`Galeria ${index + 1}`}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                      />
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full"
                                        onClick={() => removeGalleryImage(product.id, index)}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button variant="destructive" size="sm" onClick={() => removeProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Outras tabs permanecem iguais... */}
          <TabsContent value="settings" className="space-y-6">
            {profile && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Negócio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="username">Nome de Usuário (URL)</Label>
                      <Input
                        id="username"
                        value={profile.username || ""}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase() })}
                        placeholder="ex: meu-negocio"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Sua URL será: `https://link.pwer.com.br/{profile.username || "seu-nome"}`
                      </p>
                      {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
                    </div>
                    <div>
                      <Label>Nome do Empreendimento</Label>
                      <Input
                        value={profile.business_name}
                        onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={profile.business_description || ""}
                        onChange={(e) => setProfile({ ...profile, business_description: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Logos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Logo do Empreendimento</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, "business")}
                          className="flex-1"
                        />
                        {profile.business_logo_url && (
                          <img
                            src={profile.business_logo_url || "/placeholder.svg"}
                            alt="Logo do negócio"
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Logo da Empresa</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, "company")}
                          className="flex-1"
                        />
                        {profile.company_logo_url && (
                          <img
                            src={profile.company_logo_url || "/placeholder.svg"}
                            alt="Logo da empresa"
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Hero Banner (opcional)</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload(e, "hero")}
                            className="flex-1"
                          />
                          {profile.hero_banner_url && (
                            <>
                              <img
                                src={profile.hero_banner_url || "/placeholder.svg"}
                                alt="Hero Banner"
                                className="w-20 h-12 rounded object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={removeHeroBanner}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Remover
                              </Button>
                            </>
                          )}
                        </div>
                        {profile.hero_banner_url && (
                          <p className="text-xs text-gray-500">Clique em "Remover" para apagar o hero banner atual</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="design" className="space-y-6">
            {settings && (
              <Card>
                <CardHeader>
                  <CardTitle>Cores dos Botões</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cor do Botão</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.button_color}
                        onChange={(e) => setSettings({ ...settings, button_color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.button_color}
                        onChange={(e) => setSettings({ ...settings, button_color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Cor do Botão (Hover)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.button_hover_color}
                        onChange={(e) => setSettings({ ...settings, button_hover_color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.button_hover_color}
                        onChange={(e) => setSettings({ ...settings, button_hover_color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.text_color}
                        onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.text_color}
                        onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Cor do Texto (Hover)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.text_hover_color}
                        onChange={(e) => setSettings({ ...settings, text_hover_color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.text_hover_color}
                        onChange={(e) => setSettings({ ...settings, text_hover_color: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">💳 Configuração de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!stripeStatus.connected ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">
                      Conecte sua conta Stripe para receber pagamentos pelos seus produtos.
                    </p>
                    <Button onClick={handleStripeConnect} disabled={stripeLoading} className="flex items-center gap-2">
                      {stripeLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>🔗 Conectar Conta Stripe</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className={`p-4 rounded-lg border ${stripeStatus.onboarding_complete ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={stripeStatus.onboarding_complete ? "✅" : "⏳"}>
                            {stripeStatus.onboarding_complete ? "✅" : "⏳"}
                          </span>
                          <span className="font-medium">Configuração</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {stripeStatus.onboarding_complete ? "Completa" : "Pendente"}
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border ${stripeStatus.charges_enabled ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{stripeStatus.charges_enabled ? "✅" : "❌"}</span>
                          <span className="font-medium">Receber Pagamentos</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {stripeStatus.charges_enabled ? "Habilitado" : "Desabilitado"}
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border ${stripeStatus.payouts_enabled ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{stripeStatus.payouts_enabled ? "✅" : "❌"}</span>
                          <span className="font-medium">Saques</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {stripeStatus.payouts_enabled ? "Habilitado" : "Desabilitado"}
                        </p>
                      </div>
                    </div>

                    {!stripeStatus.onboarding_complete && (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">
                          Complete a configuração da sua conta para começar a receber pagamentos.
                        </p>
                        <Button
                          onClick={handleStripeRefresh}
                          disabled={stripeLoading}
                          variant="outline"
                          className="bg-transparent"
                        >
                          {stripeLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                              Carregando...
                            </>
                          ) : (
                            "Completar Configuração"
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informações Importantes</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Taxa da plataforma: 5% por transação</li>
                        <li>• Pagamentos processados diretamente na sua conta Stripe</li>
                        <li>• Suporte a cartão de crédito e PIX</li>
                        <li>• Saques automáticos conforme configuração do Stripe</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">💳 Gerenciar Assinatura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg border ${
                          subscription.status === "active"
                            ? "bg-green-50 border-green-200"
                            : subscription.status === "trialing"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>
                            {subscription.status === "active" ? "✅" : subscription.status === "trialing" ? "🆓" : "❌"}
                          </span>
                          <span className="font-medium">Status</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {subscription.status === "active"
                            ? "Ativa"
                            : subscription.status === "trialing"
                              ? "Período de Teste"
                              : subscription.status === "past_due"
                                ? "Pagamento Pendente"
                                : subscription.status === "canceled"
                                  ? "Cancelada"
                                  : "Inativa"}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                        <div className="flex items-center gap-2">
                          <span>💰</span>
                          <span className="font-medium">Plano</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {subscription.plan_name} - R$ {subscription.plan_price.toFixed(2)}/mês
                        </p>
                      </div>
                    </div>

                    {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">🎉 Período de Teste Ativo</h4>
                        <p className="text-sm text-blue-800">
                          Seu período de teste termina em:{" "}
                          {new Date(subscription.trial_end).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}

                    {subscription.current_period_end && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">📅 Próxima Cobrança</h4>
                        <p className="text-sm text-gray-600">
                          {subscription.status === "active"
                            ? `Próxima cobrança em: ${new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}`
                            : `Acesso válido até: ${new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {subscription.status === "inactive" || subscription.status === "canceled" ? (
                        <Button onClick={handleCreateSubscription} disabled={subscriptionLoading}>
                          {subscriptionLoading ? "Carregando..." : "Reativar Assinatura"}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleCancelSubscription}
                          disabled={subscriptionLoading}
                          variant="outline"
                          className="bg-transparent"
                        >
                          {subscriptionLoading ? "Carregando..." : "Cancelar Assinatura"}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">Assine o Pwerlink para ter acesso completo à plataforma.</p>
                    <Button onClick={handleCreateSubscription} disabled={subscriptionLoading}>
                      {subscriptionLoading ? "Carregando..." : "Assinar por R$ 29,90/mês"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcode" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code do seu Linktree
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                {profile?.username ? (
                  <>
                    <p className="text-gray-700">Escaneie este QR Code para acessar seu Linktree:</p>
                    <div ref={qrCodeRef} className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
                      {qrCodeUrl && <QRCode value={qrCodeUrl} size={256} level="H" />}
                    </div>
                    <p className="text-sm text-gray-500 break-all">
                      URL:{" "}
                      <a
                        href={qrCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {qrCodeUrl}
                      </a>
                    </p>
                    <Button
                      onClick={handleDownloadQrCode}
                      className="mt-4 flex items-center gap-2 mx-auto"
                      disabled={!qrCodeUrl}
                    >
                      <Download className="w-4 h-4" />
                      Baixar QR Code
                    </Button>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800">Métricas de Acesso</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{qrMetrics?.scan_count ?? 0} acessos</p>
                      {qrMetrics?.last_scanned_at && (
                        <p className="text-sm text-gray-600 mt-1">
                          Último acesso: {new Date(qrMetrics.last_scanned_at).toLocaleString()}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        onClick={handleResetQrCount}
                        className="mt-4 flex items-center gap-2 mx-auto bg-transparent"
                        disabled={saving}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Redefinir Contador
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">
                    Por favor, defina um "Nome de Usuário" na aba "Configurações" para gerar seu QR Code.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
