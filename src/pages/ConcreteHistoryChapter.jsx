import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
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

function getChapterTitlesForPeople(peopleName) {
  return Object.keys(historyHtmlModules)
    .map((path) => {
      const folderMatch = path.match(/\/data\/([^/]+)\//)
      if (folderMatch?.[1] !== peopleName) {
        return null
      }

      const fileName = path.split('/').pop() ?? ''
      const match = fileName.match(/^(\d+)\s+(.+)\.html$/i)
      if (!match) {
        return null
      }

      return {
        order: Number(match[1]),
        title: match[2].trim(),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
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

function ConcreteHistoryChapter() {
  const navigate = useNavigate()
  const location = useLocation()
  const { people, title } = useParams()
  const peopleName = decodeURIComponent(people ?? '')
  const chapterTitle = decodeURIComponent(title ?? '')
  const [openLastSpread] = useState(() => Boolean(location.state?.openLastSpread))

  useEffect(() => {
    if (location.state?.openLastSpread) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const chapterTitles = useMemo(() => getChapterTitlesForPeople(peopleName), [peopleName])
  const currentChapterIndex = chapterTitles.findIndex((chapter) => chapter.title === chapterTitle)
  const prevChapter = currentChapterIndex > 0 ? chapterTitles[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < chapterTitles.length - 1
    ? chapterTitles[currentChapterIndex + 1]
    : null

  const rawHtml = findChapterHtml(peopleName, chapterTitle)
  const chapterHtml = withResolvedChapterAssets(rawHtml, peopleName)

  const bookContent = chapterHtml || (
    <div className="people-name">Глава «{chapterTitle}» не найдена</div>
  )

  const canGoToContents = currentChapterIndex >= 0 && !nextChapter
  const canGoBackToContents = currentChapterIndex === 0

  const handlePrevChapter = () => {
    if (!prevChapter) {
      return
    }

    navigate(
      `/concrete-history/${encodeURIComponent(peopleName)}/${encodeURIComponent(prevChapter.title)}`,
      { state: { openLastSpread: true } },
    )
  }

  const handleNextChapter = () => {
    if (!nextChapter) {
      return
    }

    navigate(`/concrete-history/${encodeURIComponent(peopleName)}/${encodeURIComponent(nextChapter.title)}`)
  }

  const handleGoToContents = () => {
    navigate(`/concrete-history/${encodeURIComponent(peopleName)}`)
  }

  return (
    <section className="concrete-history-page">
      <DivImage src={titleImage} />
      <FlipBook
        content={bookContent}
        title={chapterTitle}
        hasPrevChapter={Boolean(prevChapter)}
        onPrevChapter={handlePrevChapter}
        hasNextChapter={Boolean(nextChapter)}
        onNextChapter={handleNextChapter}
        canGoToContents={canGoToContents}
        onGoToContents={handleGoToContents}
        canGoBackToContents={canGoBackToContents}
        openLastSpread={openLastSpread}
      />
      <Absolute fromCenter top={160} left={150} className="concrete-history-back">
        <BackButton />
      </Absolute>
    </section>
  )
}

export default ConcreteHistoryChapter
