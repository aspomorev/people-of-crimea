import { useEffect, useState } from 'react'
import Book from './Book'
import BookChapterTitle from './BookChapterTitle'
import flipNavImage from '../assets/стрелка для книги.png'
import { paginateBookContent } from './flipBookPaginate'
import { extractChapterTitle } from './flipBookExtractChapterTitle'
import './FlipBook.css'

function FlipBook({ content, title, className = '' }) {
  const [spreadIndex, setSpreadIndex] = useState(0)

  const isHtmlContent = typeof content === 'string'
  const { content: bookContent, title: resolvedTitle } = isHtmlContent
    ? extractChapterTitle(content, title)
    : { content, title }

  const pages = isHtmlContent ? paginateBookContent(bookContent) : ['']

  useEffect(() => {
    setSpreadIndex(0)
  }, [content])

  const leftPageIndex = spreadIndex * 2
  const rightPageIndex = leftPageIndex + 1
  const totalPages = isHtmlContent ? pages.length : 1
  const spreadCount = Math.max(1, Math.ceil(totalPages / 2))

  const canGoBack = spreadIndex > 0
  const canGoForward = spreadIndex < spreadCount - 1

  const page1Html = isHtmlContent ? pages[leftPageIndex] ?? '' : ''
  const page1Content = isHtmlContent
    ? leftPageIndex === 0 && resolvedTitle
      ? (
          <>
            <BookChapterTitle>{resolvedTitle}</BookChapterTitle>
            <div dangerouslySetInnerHTML={{ __html: page1Html }} />
          </>
        )
      : page1Html
    : content
  const page2Content = isHtmlContent ? pages[rightPageIndex] ?? '' : null

  const mergedClassName = ['flip-book', className].filter(Boolean).join(' ')

  return (
    <Book
      className={mergedClassName}
      pageType="default"
      page1Content={page1Content}
      page2Content={page2Content}
    >
      <button
        type="button"
        className="flip-book-nav flip-book-nav--prev"
        disabled={!canGoBack}
        onClick={() => setSpreadIndex((index) => index - 1)}
        aria-label="Предыдущая страница"
      >
        <img src={flipNavImage} alt="" className="flip-book-nav-image" />
      </button>

      <button
        type="button"
        className="flip-book-nav flip-book-nav--next"
        disabled={!canGoForward}
        onClick={() => setSpreadIndex((index) => index + 1)}
        aria-label="Следующая страница"
      >
        <img src={flipNavImage} alt="" className="flip-book-nav-image" />
      </button>
    </Book>
  )
}

export default FlipBook
