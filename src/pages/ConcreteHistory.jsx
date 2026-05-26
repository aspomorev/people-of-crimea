import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './ConcreteHistory.css'
import titleImage from '../assets/6-concrete-history/этнокультурный код .png'
import DivImage from '../components/DivImage'
import BackButton from '../components/BackButton'
import Absolute from '../components/Absolute'
import Book from '../components/Book'

const historyHtmlModules = import.meta.glob('../assets/6-concrete-history/data/*/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

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

function ConcreteHistory() {
  const navigate = useNavigate()
  const { people } = useParams()
  const peopleName = decodeURIComponent(people ?? '')

  const chapterTitles = useMemo(() => getChapterTitlesForPeople(peopleName), [peopleName])

  const page1Content = <div className="people-name">{peopleName || `Необходимо заполнить данные для "${peopleName}"`}</div>

  const page2Content = chapterTitles.length > 0 ? (
    <ul className="history-chapters-list">
      {chapterTitles.map(({ title }) => (
        <li key={title} className="history-chapters-item" onClick={() => navigate(`/concrete-history/${encodeURIComponent(peopleName)}/${encodeURIComponent(title)}`)}>
          {title}
        </li>
      ))}
    </ul>
  ) : <div className="people-name">Необходимо добавить главы для "{peopleName}" в "src\assets\6-concrete-history\data\{peopleName}\"</div>

  return (
    <section className="concrete-history-page">
      <DivImage src={titleImage} />
      <Book pageType="first" page1Content={page1Content} page2Content={page2Content} />
      <Absolute fromCenter top={160} left={150} className="concrete-history-back">
        <BackButton />
      </Absolute>
    </section>
  )
}

export default ConcreteHistory
