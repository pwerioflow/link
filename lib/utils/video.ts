export function getVideoEmbedUrl(url: string, autoplay = false): string | null {
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)

  if (youtubeMatch) {
    const autoplayParam = autoplay ? "&autoplay=1&mute=1" : ""
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1&enablejsapi=1${autoplayParam}`
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
  const vimeoMatch = url.match(vimeoRegex)

  if (vimeoMatch) {
    const autoplayParam = autoplay ? "&autoplay=1&muted=1" : ""
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?api=1${autoplayParam}`
  }

  return null
}

export function getVideoThumbnail(url: string): string | null {
  // YouTube thumbnail
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)

  if (youtubeMatch) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
  }

  // Vimeo thumbnail (mais complexo, mas vamos usar um placeholder por enquanto)
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
  const vimeoMatch = url.match(vimeoRegex)

  if (vimeoMatch) {
    // Para Vimeo, seria necessário fazer uma API call para obter a thumbnail
    // Por simplicidade, vamos retornar null e usar um ícone
    return null
  }

  return null
}

export function isValidVideoUrl(url: string): boolean {
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)/
  const vimeoRegex = /(?:vimeo\.com\/)/

  return youtubeRegex.test(url) || vimeoRegex.test(url)
}
