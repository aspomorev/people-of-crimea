const CHAPTER_TITLE_TAG = /<chapter-title\b[^>]*>([\s\S]*?)<\/chapter-title>/i

export function extractChapterTitle(html, fallbackTitle) {
  if (!html?.trim()) {
    return { content: html ?? '', title: fallbackTitle }
  }

  const match = html.match(CHAPTER_TITLE_TAG)
  if (!match) {
    return { content: html, title: fallbackTitle }
  }

  const extractedTitle = match[1].replace(/<[^>]+>/g, '').trim()
  const content = html.replace(match[0], '').trim()

  return {
    content,
    title: extractedTitle || fallbackTitle,
  }
}
