"use client"

import type React from "react"

import { ExternalLink } from "lucide-react"

interface ClientLinkButtonProps {
  link: any
  settings: any
  icon: React.ReactNode
}

export default function ClientLinkButton({ link, settings, icon }: ClientLinkButtonProps) {
  const handleClick = () => {
    if (link.type === "email") {
      window.location.href = `mailto:${link.href}`
    } else if (link.type === "whatsapp") {
      window.open(`https://wa.me/${link.href}`, "_blank")
    } else if (link.type === "download") {
      window.open(link.href, "_blank")
    } else {
      window.open(link.href, "_blank")
    }
  }

  return (
    <button
      onClick={handleClick}
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
      <div className="text-2xl transition-colors duration-300">{icon}</div>
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
