import { matchPath } from 'react-router-dom'
import { BACKGROUND_TYPE } from './components/Background'
import { paginateBookContent } from './components/flipBookPaginate'
import { extractChapterTitle } from './components/flipBookExtractChapterTitle'
import { extractImageUrlsFromHtml } from './utils/extractImageUrlsFromHtml'

import defaultBackgroundImage from './assets/background/фон (Крым и море).png'
import bluredBackgroundImage from './assets/background/фон .png'
import cloudImage1 from './assets/background/облако верхнее левое.png'
import cloudImage2 from './assets/background/облако верхнее правое.png'
import cloudImage3 from './assets/background/облако нижнее левое.png'
import cloudImage4 from './assets/background/облако нижнее правое.png'
import parchmentBackground from './assets/Фон пергамент.png'

import centerImage from './assets/background/Этнокультурный код Крыма.png'

import routesParchmentBg from './assets/Фон пергамент.png'
import mapImage from './assets/3-routes/Карта Крыма.png'
import studentImage from './assets/3-routes/студентка РЭУ.png'
import textPlateImage from './assets/3-routes/плашка текст.png'

import routeMapImage from './assets/4-concrete-route-map/empty-map.png'
import peopleNamePlateImage from './assets/4-concrete-route-map/people-name-plate.png'

import titleImage from './assets/6-concrete-history/этнокультурный код .png'
import defaultBookImage from './assets/стр 2. книга с краями.png'
import firstBookImage from './assets/стр 1 книга с краями.png'
import titlePlateImage from './assets/название обводка — копия.png'
import flipNavImage from './assets/стрелка для книги.png'

import backArrowImage from './assets/стрелка НАЗАД.png'
import emptyScrollImage from './assets/свиток пустой.png'

const cloudImages = [cloudImage1, cloudImage2, cloudImage3, cloudImage4]

const backgroundImagesByType = {
  [BACKGROUND_TYPE.MAP]: defaultBackgroundImage,
  [BACKGROUND_TYPE.BLURED_MAP]: bluredBackgroundImage,
  [BACKGROUND_TYPE.PARCHMENT]: parchmentBackground,
}

const logoModules = import.meta.glob('./assets/logo/*', {
  eager: true,
  import: 'default',
})
const logos = Object.values(logoModules)

const mainPageImageModules = import.meta.glob('./assets/1-main-page/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})
const mainPageImages = Object.values(mainPageImageModules)

const ageImageModules = import.meta.glob('./assets/2-timeline/data/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})
const ageImages = Object.values(ageImageModules)

const ageContentAssetModules = import.meta.glob('./assets/2-timeline/data/img/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  import: 'default',
})
const ageContentImages = Object.values(ageContentAssetModules)

const modernEthnicityImageModules = import.meta.glob('./assets/7-modern ethnicity/data/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})
const modernEthnicityImages = Object.values(modernEthnicityImageModules)

const routePlateModules = import.meta.glob('./assets/3-routes/data/*', {
  eager: true,
  import: 'default',
})
const routePlateImages = Object.values(routePlateModules)

const routeImageModules = import.meta.glob('./assets/4-concrete-route-map/data/**/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})

const cityHtmlModules = import.meta.glob('./assets/5-concrete-route-city/data/*/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const cityAssetModules = import.meta.glob('./assets/5-concrete-route-city/data/*/img/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  import: 'default',
})

const historyHtmlModules = import.meta.glob('./assets/6-concrete-history/data/*/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const chapterAssetModules = import.meta.glob('./assets/6-concrete-history/data/*/img/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  import: 'default',
})

const cityAssetUrlsByKey = Object.fromEntries(
  Object.entries(cityAssetModules).map(([path, url]) => {
    const key = path.match(/\/5-concrete-route-city\/data\/(.+)$/)?.[1] ?? ''
    return [key, url]
  }),
)

const chapterAssetUrlsByKey = Object.fromEntries(
  Object.entries(chapterAssetModules).map(([path, url]) => {
    const key = path.match(/\/data\/(.+)$/)?.[1] ?? ''
    return [key, url]
  }),
)

const backgroundRoutes = [
  { path: '/timeline', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
  { path: '/modern-ethnicity', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
  { path: '/routes', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
  { path: '/routes/map/:people/:city', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
  { path: '/routes/map/:people', backgroundType: BACKGROUND_TYPE.PARCHMENT, showClouds: true, showLogos: true },
  { path: '/routes/history/:people', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
  { path: '/routes/history/:people/:title', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
  { path: '/', backgroundType: BACKGROUND_TYPE.MAP, showClouds: true, showLogos: true },
]

const sharedUiAssets = [backArrowImage, emptyScrollImage]

function getBackgroundConfig(pathname) {
  return backgroundRoutes.find(({ path }) => matchPath({ path, end: true }, pathname))
}

function getBackgroundAssetUrls(pathname) {
  const config = getBackgroundConfig(pathname)
  if (!config) {
    return []
  }

  const urls = [backgroundImagesByType[config.backgroundType]]

  if (config.showClouds) {
    urls.push(...cloudImages)
  }

  if (config.showLogos) {
    urls.push(...logos)
  }

  return urls
}

function getRouteImage(peopleName) {
  if (!peopleName) {
    return undefined
  }

  const matches = Object.entries(routeImageModules).filter(([path]) => path.includes(peopleName))

  return (
    matches.find(([path]) => /\/route\.[^/]+$/.test(path))?.[1]
    ?? matches.find(([path]) => path.includes(`/data/${peopleName}.`))?.[1]
    ?? matches[0]?.[1]
  )
}

function getCityHtmlModulePath(peopleName, cityName) {
  return Object.keys(cityHtmlModules).find((path) => {
    const match = path.match(/\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\.html$/)
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

function findChapterHtml(peopleName, chapterTitle) {
  const entry = Object.entries(historyHtmlModules).find(([path]) => {
    const folderMatch = path.match(/\/data\/([^/]+)\//)
    if (folderMatch?.[1] !== peopleName) {
      return false
    }

    const fileName = path.split('/').pop() ?? ''
    const match = fileName.match(/^(\d+)\s+(.+)\.html$/i)
    return Boolean(match && match[2].trim() === chapterTitle)
  })

  return entry ? entry[1] : ''
}

function withResolvedChapterAssets(html, peopleName) {
  if (!html || !peopleName) {
    return html
  }

  return html.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
    (_, prefix, src, suffix) => {
      const relativePath = src.replace(/^\.\//, '')
      const assetKey = `${peopleName}/${relativePath}`
      const resolvedUrl = chapterAssetUrlsByKey[assetKey]

      return resolvedUrl ? `${prefix}${resolvedUrl}${suffix}` : `${prefix}${src}${suffix}`
    },
  )
}

function getChapterImageUrls(peopleName, chapterTitle) {
  const rawHtml = findChapterHtml(peopleName, chapterTitle)
  const resolvedHtml = withResolvedChapterAssets(rawHtml, peopleName)
  const { content } = extractChapterTitle(resolvedHtml, chapterTitle)
  const { pages } = paginateBookContent(content)

  return pages.flatMap((pageHtml) => extractImageUrlsFromHtml(pageHtml))
}

function getCityImageUrls(peopleName, cityName) {
  const modulePath = getCityHtmlModulePath(peopleName, cityName)
  const rawHtml = modulePath ? cityHtmlModules[modulePath] : ''
  const resolvedHtml = withResolvedCityAssets(rawHtml, peopleName)

  return extractImageUrlsFromHtml(resolvedHtml)
}

export function getRouteAssetUrls(pathname) {
  const urls = [...sharedUiAssets, ...getBackgroundAssetUrls(pathname)]

  if (matchPath({ path: '/', end: true }, pathname)) {
    urls.push(...mainPageImages, centerImage)
    return urls
  }

  if (matchPath({ path: '/timeline', end: true }, pathname)) {
    urls.push(routesParchmentBg, ...ageImages, ...ageContentImages)
    return urls
  }

  if (matchPath({ path: '/modern-ethnicity', end: true }, pathname)) {
    urls.push(routesParchmentBg, ...modernEthnicityImages)
    return urls
  }

  if (matchPath({ path: '/routes', end: true }, pathname)) {
    urls.push(routesParchmentBg, mapImage, studentImage, textPlateImage, ...routePlateImages)
    return urls
  }

  const routeMapMatch = matchPath({ path: '/routes/map/:people', end: true }, pathname)
  if (routeMapMatch) {
    const peopleName = decodeURIComponent(routeMapMatch.params.people ?? '')
    urls.push(routeMapImage, getRouteImage(peopleName), peopleNamePlateImage)
    return urls
  }

  const routeCityMatch = matchPath({ path: '/routes/map/:people/:city', end: true }, pathname)
  if (routeCityMatch) {
    const peopleName = decodeURIComponent(routeCityMatch.params.people ?? '')
    const cityName = decodeURIComponent(routeCityMatch.params.city ?? '')
    urls.push(routesParchmentBg, ...getCityImageUrls(peopleName, cityName))
    return urls
  }

  const historyMatch = matchPath({ path: '/routes/history/:people', end: true }, pathname)
  if (historyMatch) {
    urls.push(titleImage, firstBookImage)
    return urls
  }

  const chapterMatch = matchPath({ path: '/routes/history/:people/:title', end: true }, pathname)
  if (chapterMatch) {
    const peopleName = decodeURIComponent(chapterMatch.params.people ?? '')
    const chapterTitle = decodeURIComponent(chapterMatch.params.title ?? '')
    urls.push(
      titleImage,
      defaultBookImage,
      titlePlateImage,
      flipNavImage,
      ...getChapterImageUrls(peopleName, chapterTitle),
    )
    return urls
  }

  return urls
}
