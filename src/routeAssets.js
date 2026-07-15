const imageModules = import.meta.glob('./assets/**/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  import: 'default',
})

export function getAllAssetUrls() {
  return Object.values(imageModules)
}
