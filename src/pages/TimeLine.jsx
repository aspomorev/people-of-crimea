import { useState } from 'react'
import './TimeLine.css'
import PanelScroll from '../components/PanelScroll'
import PageImageTitle from '../components/PageImageTitle'
import DivImage from '../components/DivImage'
import parchmentBackground from '../assets/Фон пергамент.png'
import timelineCenterImage from '../assets/2-timeline/свиток ленты.png'

const ageImageModules = import.meta.glob('../assets/2-timeline/ages/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})

const ageHtmlModules = import.meta.glob('../assets/2-timeline/ages/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

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
  const activeAgeHtml = activeAgeNumber ? ageHtmlByNumber[activeAgeNumber] : ''

  return (
    <section className="timeline-page">
      <div className="timeline-panels-wrap">
        <PageImageTitle imageSrc={timelineCenterImage} />
        <div className="timeline-panels-row">
          <DivImage
            src={parchmentBackground}
            className="timeline-panel timeline-panel--left"
            width="100%"
            height="100%"
            style={{ backgroundSize: '100% 100%' }}
          >
            <p>Выберите эпоху</p>
            <div className="timeline-ages-list">
              {ageImages.map((image) => (
                <div
                  key={image.src}
                  className={`timeline-age-item${activeAgeImage === image.src ? ' timeline-age-item--active' : ''}`}
                >
                  <span className="timeline-age-dot" aria-hidden="true" />
                  <img
                    src={image.src}
                    alt={image.name}
                    className={`timeline-age-image${activeAgeImage === image.src ? ' timeline-age-image--active' : ''}`}
                    onClick={() => setActiveAgeImage(image.src)}
                  />
                </div>
              ))}
            </div>
          </DivImage>
          <DivImage
            src={parchmentBackground}
            className="timeline-panel timeline-panel--right"
            width="100%"
            height="100%"
            style={{ backgroundSize: '100% 100%' }}
          >
            <PanelScroll>
              {activeAgeHtml ? (
                <div dangerouslySetInnerHTML={{ __html: activeAgeHtml }} />
              ) : (
                'Контент для выбранной эпохи не найден.'
              )}
            </PanelScroll>
          </DivImage>
        </div>
      </div>
    </section>
  )
}

export default TimeLine
