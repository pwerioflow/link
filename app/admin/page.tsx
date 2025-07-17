"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react" // Importar useRef
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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/types/database"
import QRCode from "react-qr-code"

import { resetQrScanCount } from "@/app/actions/admin-actions"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Settings = Database["public"]["Tables"]["settings"]["Row"]
type LinkItem = Database["public"]["Tables"]["links"]["Row"]
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
  const [qrMetrics, setQrMetrics] = useState<QrCodeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [landingPageUrl, setLandingPageUrl] = useState("")
  const [usernameError, setUsernameError] = useState("")

  const supabase = createClient()
  const router = useRouter()
  const qrCodeRef = useRef<HTMLDivElement>(null) // Ref para o container do QR Code

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
    const { data: qrMetricsData } = await supabase.from("qr_code_metrics").select("*").eq("user_id", userId).single()

    setProfile(profileData)
    setSettings(settingsData)
    setLinks(linksData || [])
    setQrMetrics(qrMetricsData)
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "business" | "company") => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const path = `${user.id}/${type}-logo-${Date.now()}`
      const publicUrl = await uploadFile(file, "logos", path)

      const updateData = type === "business" ? { business_logo_url: publicUrl } : { company_logo_url: publicUrl }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

      if (error) throw error

      setProfile((prev) => (prev ? { ...prev, ...updateData } : null))
      setMessage("Logo atualizado com sucesso!")
    } catch (error) {
      console.error("Error uploading logo:", error)
      setMessage("Erro ao fazer upload do logo")
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

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, ...updates } : link)))
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

  const handleResetQrCount = async () => {
    if (!user) return
    const result = await resetQrScanCount(user.id)
    setMessage(result.message)
    if (result.success) {
      await loadUserData(user.id)
    }
  }

  // Nova função para baixar o QR Code
  const handleDownloadQrCode = () => {
    if (qrCodeRef.current) {
      const svgElement = qrCodeRef.current.querySelector("svg")
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)

        const downloadLink = document.createElement("a")
        downloadLink.href = svgUrl
        downloadLink.download = `${profile?.username || "pwerlink"}-qrcode.svg` // Nome do arquivo
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(svgUrl) // Libera a URL do objeto
      }
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>
  }

  if (!user) {
    router.push("/login")
    return null
  }

  const qrCodeUrl = profile?.username ? `${window.location.origin}/${profile.username}?source=qr` : ""

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gerenciar Links</h2>
              <Button onClick={addLink} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Link
              </Button>
            </div>

            <div className="space-y-4">
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
          </TabsContent>

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
