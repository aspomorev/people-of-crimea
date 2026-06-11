import titlePlateImage from '../assets/название обводка — копия.png'
import DivImage from './DivImage'
import './BookChapterTitle.css'

function BookChapterTitle({ children, className = '' }) {
  const mergedClassName = ['book-chapter-title', className].filter(Boolean).join(' ')

  return (
    <DivImage src={titlePlateImage} className={mergedClassName}>
      <span
        className="book-chapter-title__text"
        dangerouslySetInnerHTML={{ __html: children }}
      />
    </DivImage>
  )
}

export default BookChapterTitle
