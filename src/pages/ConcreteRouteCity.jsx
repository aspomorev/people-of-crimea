import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import PageTextTitle from '../components/PageTextTitle'
import DivImage from '../components/DivImage'
import PanelScroll from '../components/PanelScroll'
import routesParchmentBg from '../assets/Фон пергамент.png'
import './ConcreteRouteCity.css'

const cityHtmlModules = import.meta.glob('../assets/5-concrete-route-city/*/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const cityAssetModules = import.meta.glob('../assets/5-concrete-route-city/*/img/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  import: 'default',
})

const cityAssetUrlsByKey = Object.fromEntries(
  Object.entries(cityAssetModules).map(([path, url]) => {
    const key = path.match(/\/5-concrete-route-city\/(.+)$/)?.[1] ?? ''
    return [key, url]
  }),
)

function getCityHtmlModulePath(peopleName, cityName) {
  return Object.keys(cityHtmlModules).find((path) => {
    const match = path.match(/\/5-concrete-route-city\/([^/]+)\/([^/]+)\.html$/)
    return match?.[1] === peopleName && match?.[2] === cityName
  })
}

function withResolvedCityAssets(html, peopleName) {
  if (!html || !peopleName) {
    return html
  }

  return html.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
    (_, prefix, src, suffix) => {
      const relativePath = src.replace(/^\.\//, '')
      const assetKey = `${peopleName}/${relativePath}`
      const resolvedUrl = cityAssetUrlsByKey[assetKey]

      return resolvedUrl ? `${prefix}${resolvedUrl}${suffix}` : `${prefix}${src}${suffix}`
    },
  )
}

function ConcreteRouteCity() {
  const { people, city } = useParams()
  const peopleName = decodeURIComponent(people ?? '')
  const cityName = decodeURIComponent(city ?? '')

  const cityHtml = useMemo(() => {
    const modulePath = getCityHtmlModulePath(peopleName, cityName)
    const rawHtml = modulePath ? cityHtmlModules[modulePath] : ''
    return withResolvedCityAssets(rawHtml, peopleName)
  }, [peopleName, cityName])

  return (
    <section className="concrete-route-city-page">
      <div className="concrete-route-city-detail-wrap">
        <PageTextTitle>Маршруты народов Крыма</PageTextTitle>
        <DivImage
          src={routesParchmentBg}
          className="concrete-route-city-container"
          unsetSize
        >
          <div className="concrete-route-city-title">
            <p>{peopleName.toUpperCase()}</p>
            <p>{cityName}</p>
          </div>

          <PanelScroll>
              <div className="concrete-route-city-content" dangerouslySetInnerHTML={{ __html: cityHtml }} />
          </PanelScroll>
        </DivImage>
      </div>
    </section>
  )
}

export default ConcreteRouteCity
