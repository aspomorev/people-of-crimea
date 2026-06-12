import titleTopImage from '../assets/book/название главы верх.png'
import titleBottomImage from '../assets/book/название главы низ.png'
import DivImage from './DivImage'
import './BookChapterTitle.css'

function BookChapterTitle({ children, className = '' }) {
  const mergedClassName = ['book-chapter-title', className].filter(Boolean).join(' ')

  return (
    <div className={mergedClassName}>
      <DivImage src={titleTopImage} className="book-chapter-title__top" />
      <span
        className="book-chapter-title__text"
        dangerouslySetInnerHTML={{ __html: children }}
      />
      <DivImage src={titleBottomImage} className="book-chapter-title__bottom" />
    </div>
  )
}

export default BookChapterTitle
