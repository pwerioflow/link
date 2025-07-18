"use client"
import { useState } from "react"
import { Play, ChevronDown, ChevronUp } from "lucide-react"
import { getVideoEmbedUrl } from "@/lib/utils/video"

interface VideoLinkButtonProps {
  link: any
  settings: any
}

export default function VideoLinkButton({ link, settings }: VideoLinkButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const embedUrl = getVideoEmbedUrl(link.href)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  if (!embedUrl) {
    // Se a URL não for válida, não renderizar nada
    return null
  }

  return (
    <div className="w-full">
      {/* Botão do link */}
      <button
        onClick={handleToggle}
        className="w-full font-medium py-4 px-6 rounded-xl transition-all duration-300 ease-in-out hover:scale-95 flex items-center gap-4 shadow-sm hover:shadow-md group"
        style={{
          backgroundColor: settings?.button_color || "#EBE4DA",
          color: settings?.text_color || "#374151",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = settings?.button_hover_color || "#6C3F21"
          e.currentTarget.style.color = settings?.text_hover_color || "#ffffff"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = settings?.button_color || "#EBE4DA"
          e.currentTarget.style.color = settings?.text_color || "#374151"
        }}
      >
        <div className="text-2xl transition-colors duration-300">
          <Play className="w-6 h-6" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-lg">{link.title}</div>
          {link.subtitle && (
            <div className="text-sm opacity-70 group-hover:opacity-90 transition-opacity duration-300">
              {link.subtitle}
            </div>
          )}
        </div>
        <div className="transition-transform duration-300">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 opacity-50 group-hover:opacity-80" />
          ) : (
            <ChevronDown className="w-5 h-5 opacity-50 group-hover:opacity-80" />
          )}
        </div>
      </button>

      {/* Container do vídeo com efeito accordion */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              title={link.title}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}
