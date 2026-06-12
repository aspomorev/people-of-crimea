const PAGE_TAG = /<page\b([^>]*)>([\s\S]*?)<\/page>/gi
const GO_TO_ATTR = /\bgoTo\s*=\s*["']([^"']+)["']/i

function parseGoToAttribute(attrs) {
  return attrs.match(GO_TO_ATTR)?.[1]
}

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

function enhanceSectionLinks(html) {
  return html.replace(/<section\b([^>]*)>/gi, (match, attrs) => {
    const goTo = parseGoToAttribute(attrs)
    if (!goTo) {
      return match
    }

    const cleanedAttrs = attrs.replace(GO_TO_ATTR, '').trim()
    const extraAttrs = cleanedAttrs ? ` ${cleanedAttrs}` : ''

    return `<section data-goto="${goTo}"${extraAttrs}>`
  })
}

export function paginateBookContent(html) {
  if (!html?.trim()) {
    return { pages: [''], goToSpreadIndex: {} }
  }

  const pages = []
  const goToSpreadIndex = {}

  for (const match of html.matchAll(PAGE_TAG)) {
    const pageIndex = pages.length
    const goTo = parseGoToAttribute(match[1])

    if (goTo) {
      goToSpreadIndex[goTo] = Math.floor(pageIndex / 2)
    }

    const wrappedPage = wrapBookPageHtml(enhanceSectionLinks(match[2]))
    if (wrappedPage.length > 0) {
      pages.push(wrappedPage)
    }
  }

  if (pages.length) {
    return { pages, goToSpreadIndex }
  }

  const wrapped = wrapBookPageHtml(html)
  return {
    pages: wrapped.length ? [wrapped] : [''],
    goToSpreadIndex,
  }
}
