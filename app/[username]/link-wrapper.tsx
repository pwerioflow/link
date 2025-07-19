"use client"
import { useVideo } from "@/lib/context/video-context"
import type React from "react"

import ClientLinkButton from "./client-link-button"
import VideoLinkButton from "./video-link-button"

interface LinkWrapperProps {
  link: any
  settings: any
  icon?: React.ReactNode
}

export default function LinkWrapper({ link, settings, icon }: LinkWrapperProps) {
  const { stopAllVideos } = useVideo()

  if (link.type === "video") {
    return <VideoLinkButton link={link} settings={settings} />
  }

  // Para links normais, parar todos os vídeos quando clicado
  const handleLinkClick = () => {
    stopAllVideos()
  }

  return (
    <div onClick={handleLinkClick}>
      <ClientLinkButton link={link} settings={settings} icon={icon} />
    </div>
  )
}
