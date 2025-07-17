import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Pwer Link", // Título da página
  description: "Seu link único. Todas as conexões.", // Novo slogan
  generator: null, // Remove o gerador v0.dev
  icons: null, // Remove qualquer ícone padrão
  openGraph: {
    title: "Pwer Link",
    description: "Seu link único. Todas as conexões.",
    images: [
      {
        url: "/images/og-image.jpeg", // Caminho para a imagem Open Graph
        width: 1200,
        height: 630,
        alt: "Pwer Link - Árvore de Conexões Digitais",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pwer Link",
    description: "Seu link único. Todas as conexões.",
    images: ["/images/og-image.jpeg"],
  },
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
