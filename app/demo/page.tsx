"use client"
import { Instagram, Mail, Globe, Download, MessageCircle, Play, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VideoProvider } from "@/lib/context/video-context"
import LinkWrapper from "@/app/[username]/link-wrapper"

interface LinkItem {
  id: string
  href: string
  title: string
  subtitle: string
  type: "link" | "email" | "whatsapp" | "download" | "video"
  iconType: "instagram" | "email" | "website" | "download" | "whatsapp" | "video"
  autoplay_video?: boolean
}

interface AppSettings {
  businessName: string
  businessDescription: string
  businessLogo: string
  companyLogo: string
  buttonColor: string
  buttonHoverColor: string
  textColor: string
  textHoverColor: string
}

const iconMap = {
  instagram: <Instagram />,
  email: <Mail />,
  website: <Globe />,
  download: <Download />,
  whatsapp: <MessageCircle />,
  video: <Play />,
}

const demoSettings: AppSettings = {
  businessName: "Meu Negócio Demo",
  businessDescription: "Esta é uma demonstração do Linktree",
  businessLogo: "/placeholder.svg?height=80&width=80",
  companyLogo: "/placeholder.svg?height=40&width=40",
  buttonColor: "#EBE4DA",
  buttonHoverColor: "#6C3F21",
  textColor: "#374151",
  textHoverColor: "#ffffff",
}

const demoLinks: LinkItem[] = [
  {
    id: "1",
    href: "https://instagram.com/exemplo",
    title: "Instagram",
    subtitle: "Siga nosso perfil",
    type: "link",
    iconType: "instagram",
  },
  {
    id: "2",
    href: "contato@exemplo.com",
    title: "Email",
    subtitle: "Entre em contato conosco",
    type: "email",
    iconType: "email",
  },
  {
    id: "3",
    href: "https://exemplo.com",
    title: "Website",
    subtitle: "Visite nosso site",
    type: "link",
    iconType: "website",
  },
  {
    id: "4",
    href: "5511999999999",
    title: "WhatsApp",
    subtitle: "Fale conosco",
    type: "whatsapp",
    iconType: "whatsapp",
  },
  {
    id: "5",
    href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Vídeo Demonstração",
    subtitle: "Assista nosso vídeo",
    type: "video",
    iconType: "video",
    autoplay_video: true,
  },
]

interface LinkButtonProps {
  link: LinkItem
  settings: AppSettings
}

function LinkButton({ link, settings }: LinkButtonProps) {
  const handleClick = () => {
    if (link.type === "email") {
      window.location.href = `mailto:${link.href}`
    } else if (link.type === "whatsapp") {
      window.open(`https://wa.me/${link.href}`, "_blank")
    } else if (link.type === "download") {
      const a = document.createElement("a")
      a.href = link.href
      a.download = link.title
      a.click()
    } else {
      window.open(link.href, "_blank")
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full font-medium py-4 px-6 rounded-xl transition-all duration-300 ease-in-out hover:scale-95 flex items-center gap-4 shadow-sm hover:shadow-md group"
      style={{
        backgroundColor: settings.buttonColor,
        color: settings.textColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = settings.buttonHoverColor
        e.currentTarget.style.color = settings.textHoverColor
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = settings.buttonColor
        e.currentTarget.style.color = settings.textColor
      }}
    >
      <div className="text-2xl transition-colors duration-300">{iconMap[link.iconType]}</div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-lg">{link.title}</div>
        {link.subtitle && (
          <div className="text-sm opacity-70 group-hover:opacity-90 transition-opacity duration-300">
            {link.subtitle}
          </div>
        )}
      </div>
      <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
    </button>
  )
}

export default function DemoPage() {
  return (
    <VideoProvider>
      <div className="min-h-screen bg-white">
        {/* Header com botões de ação */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Demonstração</h2>
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Criar Conta</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-8">
          {/* Logo do Empreendimento */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Image
                src={demoSettings.businessLogo || "/placeholder.svg"}
                alt="Logo do Empreendimento"
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{demoSettings.businessName}</h1>
            <p className="text-gray-600 text-sm">{demoSettings.businessDescription}</p>
          </div>

          {/* Links */}
          <div className="space-y-4 mb-12">
            {demoLinks.map((link) => (
              <LinkWrapper key={link.id} link={link} settings={demoSettings} icon={iconMap[link.iconType]} />
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mb-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Crie seu próprio Linktree!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Personalize cores, adicione seus links e gerencie tudo facilmente.
            </p>
            <Link href="/login">
              <Button className="w-full">Começar Agora</Button>
            </Link>
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
      </div>
    </VideoProvider>
  )
}
