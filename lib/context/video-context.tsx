"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

interface VideoContextType {
  activeVideoId: string | null
  setActiveVideo: (videoId: string | null) => void
  stopAllVideos: () => void
}

const VideoContext = createContext<VideoContextType | null>(null)

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const setActiveVideo = useCallback((videoId: string | null) => {
    setActiveVideoId(videoId)
  }, [])

  const stopAllVideos = useCallback(() => {
    setActiveVideoId(null)
  }, [])

  return (
    <VideoContext.Provider value={{ activeVideoId, setActiveVideo, stopAllVideos }}>{children}</VideoContext.Provider>
  )
}

export function useVideo() {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider")
  }
  return context
}
