const PAGE_BREAK_TAG = /<page\b[^>]*\/?>/gi

function wrapBookPageHtml(fragment) {
  const trimmed = fragment.trim()
  if (!trimmed) {
    return ''
  }

  if (/<div[^>]*\bbook-content\b/i.test(trimmed)) {
    return trimmed
  }

  const withoutClosingDiv = trimmed.replace(/<\/div>\s*$/i, '').trim()
  return `<div class="book-content">${withoutClosingDiv}</div>`
}

export function paginateBookContent(html) {
  if (!html?.trim()) {
    return ['']
  }

  const pages = html
    .split(PAGE_BREAK_TAG)
    .map((part) => wrapBookPageHtml(part))
    .filter((part) => part.length > 0)

  return pages.length ? pages : ['']
}
