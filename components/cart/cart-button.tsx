"use client"

import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export function CartButton() {
  const { getTotalItems, openCart } = useCart()
  const totalItems = getTotalItems()

  if (totalItems === 0) return null

  return (
    <Button onClick={openCart} className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-40" size="icon">
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </div>
    </Button>
  )
}
