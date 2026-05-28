const IMG_SRC_PATTERN = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi

export function extractImageUrlsFromHtml(html) {
  if (!html?.trim()) {
    return []
  }

  const urls = []
  let match = IMG_SRC_PATTERN.exec(html)

  while (match) {
    urls.push(match[1])
    match = IMG_SRC_PATTERN.exec(html)
  }

  IMG_SRC_PATTERN.lastIndex = 0
  return urls
}
