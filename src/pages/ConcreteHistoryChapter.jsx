import { useParams } from 'react-router-dom'
import './ConcreteHistory.css'
import titleImage from '../assets/6-concrete-history/этнокультурный код .png'
import DivImage from '../components/DivImage'
import BackButton from '../components/BackButton'
import Absolute from '../components/Absolute'
import FlipBook from '../components/FlipBook'

const historyHtmlModules = import.meta.glob('../assets/6-concrete-history/data/*/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const chapterAssetModules = import.meta.glob('../assets/6-concrete-history/data/*/img/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  import: 'default',
})

const chapterAssetUrlsByKey = Object.fromEntries(
  Object.entries(chapterAssetModules).map(([path, url]) => {
    const key = path.match(/\/data\/(.+)$/)?.[1] ?? ''
    return [key, url]
  }),
)

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

function ConcreteHistoryChapter() {
  const { people, title } = useParams()
  const peopleName = decodeURIComponent(people ?? '')
  const chapterTitle = decodeURIComponent(title ?? '')

  const rawHtml = findChapterHtml(peopleName, chapterTitle)
  const chapterHtml = withResolvedChapterAssets(rawHtml, peopleName)

  const bookContent = chapterHtml || (
    <div className="people-name">Глава «{chapterTitle}» не найдена</div>
  )

  return (
    <section className="concrete-history-page">
      <DivImage src={titleImage} />
      <FlipBook content={bookContent} title={chapterTitle} />
      <Absolute fromCenter top={160} left={150} className="concrete-history-back">
        <BackButton />
      </Absolute>
    </section>
  )
}

export default ConcreteHistoryChapter
