const CHAPTER_TITLE_TAG = /<chapter-title\b[^>]*>([\s\S]*?)<\/chapter-title>/i
const BR_TAG = /<br\s*\/?>/gi

function sanitizeChapterTitleHtml(html) {
  return html
    .replace(BR_TAG, '[[BR]]')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[BR\]\]/g, '<br />')
    .trim()
}

export function extractChapterTitle(html, fallbackTitle) {
  if (!html?.trim()) {
    return { content: html ?? '', title: fallbackTitle }
  }

  const match = html.match(CHAPTER_TITLE_TAG)
  if (!match) {
    return { content: html, title: fallbackTitle }
  }

  const extractedTitle = sanitizeChapterTitleHtml(match[1])
  const content = html.replace(match[0], '').trim()

  return {
    content,
    title: extractedTitle || fallbackTitle,
  }
}
