import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import PageTextTitle from '../components/PageTextTitle'
import PanelScroll from '../components/PanelScroll'
import DivImage from '../components/DivImage'
import parchmentBackground from '../assets/Фон пергамент.png'
import './ConcreteHistory.css'

const historyHtmlModules = import.meta.glob('../assets/5-concrete-history/data/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const historyHtmlByPeople = Object.entries(historyHtmlModules).reduce((acc, [path, html]) => {
  const peopleName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? ''

  if (peopleName) {
    acc[peopleName] = html
  }

  return acc
}, {})

function ConcreteHistory() {
  const { people } = useParams()

  const peopleName = useMemo(() => {
    if (!people) {
      return ''
    }

    return decodeURIComponent(people)
  }, [people])

  const historyHtml = peopleName ? historyHtmlByPeople[peopleName] : ''

  return (
    <section className="concrete-history-page">
      <div className="concrete-history-wrap">
        <PageTextTitle>Маршруты народов Крыма</PageTextTitle>
        <DivImage
          src={parchmentBackground}
          className="concrete-history-panel"
          width="100%"
          height="100%"
          style={{ backgroundSize: '100% 100%' }}
        >
          <PanelScroll>
            {historyHtml ? (
              <div dangerouslySetInnerHTML={{ __html: historyHtml }} />
            ) : (
              <p>Контент для «{peopleName || 'неизвестный народ'}» не найден.</p>
            )}
          </PanelScroll>
        </DivImage>
      </div>
    </section>
  )
}

export default ConcreteHistory
