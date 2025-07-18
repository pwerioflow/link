"use client"

import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import type { Database } from "@/lib/types/database"

type Product = Database["public"]["Tables"]["products"]["Row"]

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {product.image_url ? (
          <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📦</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        {product.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>}
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-gray-900">R$ {product.price.toFixed(2)}</span>
          <Button size="sm" onClick={handleAddToCart} className="h-8 px-3 text-xs">
            <ShoppingCart className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
