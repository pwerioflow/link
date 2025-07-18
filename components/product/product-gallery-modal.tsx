"use client"

import type React from "react"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ProductGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  productName: string
  initialIndex?: number
}

export function ProductGalleryModal({
  isOpen,
  onClose,
  images,
  productName,
  initialIndex = 0,
}: ProductGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen) return null

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose()
    if (e.key === "ArrowRight") nextImage()
    if (e.key === "ArrowLeft") prevImage()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Botão Fechar */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Navegação - Anterior */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 z-10 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {/* Imagem Principal */}
        <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
          <Image
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`${productName} - Imagem ${currentIndex + 1}`}
            width={800}
            height={600}
            className="max-w-full max-h-[80vh] object-contain"
            priority
          />
        </div>

        {/* Navegação - Próxima */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 z-10 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}

        {/* Indicadores */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
              />
            ))}
          </div>
        )}

        {/* Contador */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}
