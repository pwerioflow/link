import { ImageResponse } from "next/og"

// URLs de blob para as imagens
const PWER_LINK_OG_IMAGE_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Flux_Dev_A_stylized_digital_tree_with_glowing_branches_extendi_1.jpg-3FtGzDBnt7Pj2XdXWh3pBdYNTBHDDc.jpeg"
const CALBOR_OG_IMAGE_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Folder_Digital_Calbor.jpg-Zkp52r2Y5YZiuROpAwLwu6gABkzAqw.jpeg"

// Tamanho padrão para Open Graph images
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/jpeg" // Definir o tipo de conteúdo da imagem

export default async function Image({ params }: { params: { username: string } }) {
  let imageUrl: string
  let altText: string
  let titleText: string
  let descriptionText: string

  if (params.username === "calbor") {
    // Para a URL da Calbor, use a imagem da casa
    imageUrl = CALBOR_OG_IMAGE_URL
    altText = "Praia do Castelo - Calbor Engenharia"
    titleText = "Praia do Castelo"
    descriptionText = "Alto Padrão em meio a natureza."
  } else {
    // Para outras URLs, use a imagem genérica do Pwer Link
    imageUrl = PWER_LINK_OG_IMAGE_URL
    altText = "Pwer Link - Árvore de Conexões Digitais"
    titleText = "Pwer Link"
    descriptionText = "Seu link único. Todas as conexões."
  }

  let imageData: ArrayBuffer | null = null
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`Failed to fetch image: ${imageUrl}, status: ${response.status}`)
      // Fallback para placeholder se a imagem não puder ser carregada
      // Usar um placeholder SVG genérico ou uma imagem de fallback conhecida
      const fallbackResponse = await fetch("https://via.placeholder.com/1200x630.png?text=Image+Not+Found")
      imageData = await fallbackResponse.arrayBuffer()
    } else {
      imageData = await response.arrayBuffer()
    }
  } catch (error) {
    console.error(`Error fetching image ${imageUrl}:`, error)
    // Fallback para placeholder em caso de erro de rede
    const fallbackResponse = await fetch("https://via.placeholder.com/1200x630.png?text=Image+Load+Error")
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
