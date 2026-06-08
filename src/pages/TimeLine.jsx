import { useState } from 'react'
import './TimeLine.css'
import PanelScroll from '../components/PanelScroll'
import PageTextTitle from '../components/PageTextTitle'
import DivImage from '../components/DivImage'
import parchmentBackground from '../assets/Фон пергамент.png'

const ageImageModules = import.meta.glob('../assets/2-timeline/data/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})

const ageHtmlModules = import.meta.glob('../assets/2-timeline/data/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const ageAssetModules = import.meta.glob('../assets/2-timeline/data/img/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  import: 'default',
})

const ageAssetUrlsByKey = Object.fromEntries(
  Object.entries(ageAssetModules).map(([path, url]) => {
    const key = path.match(/\/2-timeline\/data\/(.+)$/)?.[1] ?? ''
    return [key, url]
  }),
)

function withResolvedAgeAssets(html) {
  if (!html) {
    return html
  }

  return html.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
    (_, prefix, src, suffix) => {
      const relativePath = src.replace(/^\.\//, '')
      const resolvedUrl = ageAssetUrlsByKey[relativePath]

      return resolvedUrl ? `${prefix}${resolvedUrl}${suffix}` : `${prefix}${src}${suffix}`
    },
  )
}

const ageImages = Object.entries(ageImageModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, undefined, { numeric: true }))
  .map(([path, src]) => ({
    src,
    name: path.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? 'age',
  }))

const ageHtmlByNumber = Object.entries(ageHtmlModules).reduce((acc, [path, html]) => {
  const fileName = path.split('/').pop() ?? ''
  const number = fileName.match(/^(\d+)/)?.[1]
  if (number) {
    acc[number] = html
  }
  return acc
}, {})

function TimeLine() {
  const [activeAgeImage, setActiveAgeImage] = useState(ageImages[0]?.src ?? null)
  const activeAge = ageImages.find((image) => image.src === activeAgeImage)
  const activeAgeNumber = activeAge?.name.match(/^(\d+)/)?.[1]
  const activeAgeHtml = activeAgeNumber
    ? withResolvedAgeAssets(ageHtmlByNumber[activeAgeNumber])
    : ''

  return (
    <section className="timeline-page">
      <div className="panels-wrap">
        <PageTextTitle>Лента времени</PageTextTitle>
        <div className="panels-row">
          <DivImage
            src={parchmentBackground}
            className="panel panel--left"
            unsetSize
            style={{ backgroundSize: '100% 100%' }}
          >
            <p>Выберите эпоху</p>
            <div className="panel-list">
              {ageImages.map((image) => (
                <div
                  key={image.src}
                  className={`panel-item${activeAgeImage === image.src ? ' panel-item--active' : ''}`}
                >
                  <span className="timeline-age-dot" aria-hidden="true" />
                  <img
                    src={image.src}
                    alt={image.name}
                    className={`panel-item-image${activeAgeImage === image.src ? ' panel-item-image--active' : ''}`}
                    onClick={() => setActiveAgeImage(image.src)}
                  />
                </div>
              ))}
            </div>
          </DivImage>
          <DivImage
            src={parchmentBackground}
            className="panel panel--right"
            unsetSize
            style={{ backgroundSize: '100% 100%' }}
          >
            <PanelScroll key={activeAgeNumber}>
              {activeAgeHtml ? (
                <div className="panel-content" dangerouslySetInnerHTML={{ __html: activeAgeHtml }} />
              ) : (
                <div className="panel-content">Контент для выбранной эпохи не найден.</div>
              )}
            </PanelScroll>
          </DivImage>
        </div>
      </div>
    </section>
  )
}

export default TimeLine
