import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Pwer Link", // Título padrão da página
  description: "Seu link único. Todas as conexões.", // Slogan padrão
  generator: null, // Remove o gerador v0.dev
  icons: null, // Remove qualquer ícone padrão
  // As configurações de Open Graph e Twitter serão gerenciadas dinamicamente por opengraph-image.tsx
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
