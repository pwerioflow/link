import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Pwer Link", // Título padrão da página
  description: "Seu link único. Todas as conexões.", // Slogan padrão
  generator: null, // Remove o gerador v0.dev
  icons: null, // Remove qualquer ícone padrão
  openGraph: {
    title: "Pwer Link",
    description: "Seu link único. Todas as conexões.",
    url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
    type: "website",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Flux_Dev_A_stylized_digital_tree_with_glowing_branches_extendi_1.jpg-3FtGzDBnt7Pj2XdXWh3pBdYNTBHDDc.jpeg", // Imagem OG genérica para o layout padrão
        width: 1200,
        height: 630,
        alt: "Pwer Link - Árvore de Conexões Digitais",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pwer Link",
    description: "Seu link único. Todas as conexões.",
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Flux_Dev_A_stylized_digital_tree_with_glowing_branches_extendi_1.jpg-3FtGzDBnt7Pj2XdXWh3pBdYNTBHDDc.jpeg",
    ], // Imagem OG genérica para o layout padrão
  },
  // Se você tiver um Facebook App ID, adicione-o aqui para todo o site:
  // facebook: {
  //   appId: 'SEU_FACEBOOK_APP_ID_GLOBAL',
  // },
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
