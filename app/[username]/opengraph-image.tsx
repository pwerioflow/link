import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

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
    imageUrl = join(process.cwd(), "public/images/og-image-calbor.jpeg")
    altText = "Praia do Castelo - Calbor Engenharia"
    titleText = "Praia do Castelo"
    descriptionText = "Alto Padrão em meio a natureza."
  } else {
    // Para outras URLs, use a imagem genérica do Pwer Link
    imageUrl = join(process.cwd(), "public/images/og-image.jpeg")
    altText = "Pwer Link - Árvore de Conexões Digitais"
    titleText = "Pwer Link"
    descriptionText = "Seu link único. Todas as conexões."
  }

  const imageData = await readFile(imageUrl)
  const imageSrc = Uint8Array.from(imageData).buffer

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
      <img
        src={imageSrc || "/placeholder.svg"}
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
      {/* Opcional: Adicionar texto sobre a imagem se necessário, mas as imagens já têm texto */}
      {/* <div style={{ position: 'relative', zIndex: 10, padding: '20px', background: 'rgba(0,0,0,0.5)' }}>
          <h1>{titleText}</h1>
          <p>{descriptionText}</p>
        </div> */}
    </div>,
    {
      ...size,
      alt: altText,
      // Não precisamos de fontes personalizadas se a imagem já tem o texto
    },
  )
}
