import DivImage from './DivImage'
import boookImage from '../assets/книга пустая стартовая.png'
import './Book.css'

function renderPageContent(content) {
  if (content == null || content === '') {
    return null
  }

  if (typeof content === 'string' && content.trim().startsWith('<')) {
    return <div className="book-page-content" dangerouslySetInnerHTML={{ __html: content }} />
  }

  return <div className="book-page-content">{content}</div>
}

function Book({ page1Content, page2Content, className = '' }) {
  const mergedClassName = ['book', className].filter(Boolean).join(' ')

  return (
    <div className={mergedClassName}>
      <DivImage src={boookImage} className="book-container" >
        <div className="page page1">{renderPageContent(page1Content)}</div>
        <div className="page page2">{renderPageContent(page2Content)}</div>
      </DivImage>
    </div>
  )
}

export default Book
