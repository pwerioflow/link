"use client"

import { useState } from "react"
import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus } from "lucide-react"
import Image from "next/image"
import type { Database } from "@/lib/types/database"
import { ProductGalleryModal } from "@/components/product/product-gallery-modal"

type Product = Database["public"]["Tables"]["products"]["Row"]

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const handleAddToCart = () => {
    addItem(product)
  }

  const handleImageClick = () => {
    const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean) as string[]
    if (allImages.length > 0) {
      setIsGalleryOpen(true)
    }
  }

  const isHalfSize = product.display_size === "half"
  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean) as string[]
  const isOutOfStock = product.stock_quantity !== null && product.stock_quantity <= 0

  return (
    <>
      <div
        className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
          isHalfSize ? "" : "col-span-2"
        }`}
      >
        <div className="aspect-square bg-gray-100 relative cursor-pointer group" onClick={handleImageClick}>
          {product.image_url ? (
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📦</div>
          )}

          {/* Indicador de galeria */}
          {allImages.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{allImages.length - 1}
            </div>
          )}

          {/* Indicador de estoque */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded">Esgotado</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3
            className={`font-medium text-gray-900 mb-1 ${isHalfSize ? "text-sm line-clamp-1" : "text-sm line-clamp-2"}`}
          >
            {product.name}
          </h3>

          {/* Descrição só aparece em cards full */}
          {!isHalfSize && product.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
          )}

          {/* Estoque */}
          {product.stock_quantity !== null && product.stock_quantity > 0 && product.stock_quantity <= 10 && (
            <p className="text-xs text-orange-600 mb-2">Apenas {product.stock_quantity} em estoque</p>
          )}

          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-gray-900">R$ {product.price.toFixed(2)}</span>

            {isHalfSize ? (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="h-8 w-8 p-0 bg-black hover:bg-gray-800"
                disabled={isOutOfStock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleAddToCart} className="h-8 px-3 text-xs" disabled={isOutOfStock}>
                <ShoppingCart className="w-3 h-3 mr-1" />
                {isOutOfStock ? "Esgotado" : "Adicionar"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal da Galeria */}
      <ProductGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={allImages}
        productName={product.name}
      />
    </>
  )
}
