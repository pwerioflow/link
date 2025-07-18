"use client"

import { useCart } from "@/lib/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"

export function CartDrawer() {
  const { state, closeCart, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart()

  if (!state.isOpen) return null

  const handleCheckout = async () => {
    try {
      // Pegar username da URL atual
      const username = window.location.pathname.split("/")[1]

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: state.items,
          username: username,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("Checkout error:", data.error)
        alert("Erro ao processar checkout: " + data.error)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Erro ao processar checkout")
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Carrinho de Compras
          </h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          {state.items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Seu carrinho está vazio</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url || "/placeholder.svg"}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">R$ {item.product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 bg-transparent"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, Number.parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 bg-transparent"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold">R$ {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Button onClick={handleCheckout} className="w-full">
                    Finalizar Compra
                  </Button>
                  <Button variant="outline" onClick={clearCart} className="w-full bg-transparent">
                    Limpar Carrinho
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
