const PAGE_BREAK_TAG = /<line\b[^>]*\/?>/gi

export function paginateBookContent(html) {
  if (!html?.trim()) {
    return ['']
  }

  const pages = html
    .split(PAGE_BREAK_TAG)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  return pages.length ? pages : ['']
}
