export function preloadImage(src) {
  if (!src) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => resolve()
    image.src = src
  })
}

export function preloadImages(urls) {
  const unique = [...new Set(urls.filter(Boolean))]
  return Promise.all(unique.map(preloadImage))
}
