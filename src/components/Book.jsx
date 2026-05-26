import DivImage from './DivImage'
import defaultBookImage from '../assets/книга раскрытая пустая.png'
import firstBookImage from '../assets/книга пустая стартовая.png'
import './Book.css'

const bookImagesByType = {
  default: defaultBookImage,
  first: firstBookImage,
}

function renderPageContent(content) {
  if (content == null || content === '') {
    return null
  }

  if (typeof content === 'string' && content.trim().startsWith('<')) {
    return <div className="book-page-content" dangerouslySetInnerHTML={{ __html: content }} />
  }

  return <div className="book-page-content">{content}</div>
}

function Book({ page1Content, page2Content, pageType = 'first', className = '', children }) {
  const mergedClassName = ['book', className].filter(Boolean).join(' ')
  const bookImage = bookImagesByType[pageType] ?? bookImagesByType.first

  return (
    <div className={mergedClassName}>
      <DivImage src={bookImage} className="book-container" width={1920} height={1080}>
        <div className="page page1">{renderPageContent(page1Content)}</div>
        <div className="page page2">{renderPageContent(page2Content)}</div>
        {children}
      </DivImage>
    </div>
  )
}

export default Book
