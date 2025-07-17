import { ImageResponse } from "next/og"

// Tamanho padrão para Open Graph images
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/jpeg" // Definir o tipo de conteúdo da imagem

export default async function Image({ params }: { params: { username: string } }) {
  let imageUrlPath: string // Caminho público da imagem
  let altText: string
  let titleText: string
  let descriptionText: string

  if (params.username === "calbor") {
    // Para a URL da Calbor, use a imagem da casa
    imageUrlPath = "/images/og-image-calbor.jpeg"
    altText = "Praia do Castelo - Calbor Engenharia"
    titleText = "Praia do Castelo"
    descriptionText = "Alto Padrão em meio a natureza."
  } else {
    // Para outras URLs, use a imagem genérica do Pwer Link
    imageUrlPath = "/images/og-image.jpeg"
    altText = "Pwer Link - Árvore de Conexões Digitais"
    titleText = "Pwer Link"
    descriptionText = "Seu link único. Todas as conexões."
  }

  // Construir a URL completa da imagem para fetch
  // Em ambiente de build do Vercel, process.env.VERCEL_URL pode não estar disponível
  // ou ser o URL de preview. Usaremos uma URL relativa que o Next.js resolve.
  // Para garantir que funcione em qualquer ambiente, podemos usar uma URL absoluta se soubermos o domínio.
  // No entanto, para o contexto de OG Image, o Next.js geralmente resolve caminhos /public/ corretamente.
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  const fullImageUrl = `${baseUrl}${imageUrlPath}`

  let imageData: ArrayBuffer | null = null
  try {
    const response = await fetch(fullImageUrl)
    if (!response.ok) {
      console.error(`Failed to fetch image: ${fullImageUrl}, status: ${response.status}`)
      // Fallback para placeholder se a imagem não puder ser carregada
      const fallbackResponse = await fetch(`${baseUrl}/placeholder.svg`)
      imageData = await fallbackResponse.arrayBuffer()
    } else {
      imageData = await response.arrayBuffer()
    }
  } catch (error) {
    console.error(`Error fetching image ${fullImageUrl}:`, error)
    // Fallback para placeholder em caso de erro de rede
    const fallbackResponse = await fetch(`${baseUrl}/placeholder.svg`)
    imageData = await fallbackResponse.arrayBuffer()
  }

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "black", // Fundo escuro para combinar com as imagens
        color: "white",
        fontSize: 48,
        textAlign: "center",
      }}
    >
      {imageData && (
        <img
          src={imageData || "/placeholder.svg"}
          alt={altText}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover", // Garante que a imagem cubra todo o espaço
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      )}
    </div>,
    {
      ...size,
      alt: altText,
    },
  )
}
