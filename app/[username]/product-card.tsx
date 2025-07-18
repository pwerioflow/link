"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import type { Database } from "@/lib/types/database"

type Product = Database["public"]["Tables"]["products"]["Row"]

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleAddToCart = () => {
    addItem(product)
  }

  const handleCardClick = () => {
    if (product.display_size === "half" && !isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(false)
  }

  const isHalfSize = product.display_size === "half"
  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean) as string[]
  const isOutOfStock = product.stock_quantity !== null && product.stock_quantity <= 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Determinar se deve mostrar como card expandido (largura inteira)
  const showAsFullWidth = !isHalfSize || isExpanded

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group ${
        showAsFullWidth ? "col-span-2" : ""
      } ${isHalfSize && !isExpanded ? "cursor-pointer" : ""}`}
      onClick={isHalfSize && !isExpanded ? handleCardClick : undefined}
    >
      {/* Galeria de imagens */}
      <div className="aspect-square bg-gray-100 relative">
        {allImages.length > 0 ? (
          <>
            <Image
              src={allImages[currentImageIndex] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />

            {/* Navegação - aparece sempre em cards expandidos ou de largura inteira */}
            {showAsFullWidth && allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📦</div>
        )}

        {/* Indicador de múltiplas imagens */}
        {allImages.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1}/{allImages.length}
          </div>
        )}

        {/* Botão de colapsar para cards expandidos */}
        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 bg-white/80 hover:bg-white text-gray-700 text-xs"
            onClick={handleCollapseClick}
          >
            ← Voltar
          </Button>
        )}

        {/* Indicador de estoque */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded">Esgotado</span>
          </div>
        )}
      </div>

      {/* Indicadores de imagem para cards de largura inteira */}
      {showAsFullWidth && allImages.length > 1 && (
        <div className="flex justify-center py-2 gap-1">
          {allImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-gray-800" : "bg-gray-300"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex(index)
              }}
            />
          ))}
        </div>
      )}

      <div className="p-3">
        <h3
          className={`font-medium text-gray-900 mb-1 ${
            showAsFullWidth ? "text-sm line-clamp-2" : "text-sm line-clamp-1"
          }`}
        >
          {product.name}
        </h3>

        {/* Descrição aparece em cards expandidos ou de largura inteira */}
        {showAsFullWidth && product.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        )}

        {/* Estoque */}
        {product.stock_quantity !== null && product.stock_quantity > 0 && product.stock_quantity <= 10 && (
          <p className="text-xs text-orange-600 mb-2">Apenas {product.stock_quantity} em estoque</p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-gray-900">R$ {product.price.toFixed(2)}</span>

          {!showAsFullWidth ? (
            // Botão pequeno para cards de meia página não expandidos
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart()
              }}
              className="h-8 w-8 p-0 bg-black hover:bg-gray-800"
              disabled={isOutOfStock}
            >
              <Plus className="w-4 h-4" />
            </Button>
          ) : (
            // Botão completo para cards expandidos ou de largura inteira
            <Button size="sm" onClick={handleAddToCart} className="h-8 px-3 text-xs" disabled={isOutOfStock}>
              <ShoppingCart className="w-3 h-3 mr-1" />
              {isOutOfStock ? "Esgotado" : "Adicionar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
