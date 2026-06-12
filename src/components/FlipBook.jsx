import { useCallback, useEffect, useMemo, useState } from 'react'
import Book from './Book'
import BookChapterTitle from './BookChapterTitle'
import flipNavImage from '../assets/book/стрелка для книги.png'
import { paginateBookContent } from './flipBookPaginate'
import { extractChapterTitle } from './flipBookExtractChapterTitle'
import './FlipBook.css'

function FlipBook({
  content,
  title,
  className = '',
  hasPrevChapter = false,
  onPrevChapter,
  hasNextChapter = false,
  onNextChapter,
  canGoToContents = false,
  onGoToContents,
  canGoBackToContents = false,
  openLastSpread = false,
}) {
  const [spreadIndex, setSpreadIndex] = useState(0)

  const isHtmlContent = typeof content === 'string'
  const { content: bookContent, title: resolvedTitle } = isHtmlContent
    ? extractChapterTitle(content, title)
    : { content, title }

  const { pages, goToSpreadIndex } = useMemo(
    () => (isHtmlContent ? paginateBookContent(bookContent) : { pages: [''], goToSpreadIndex: {} }),
    [bookContent, isHtmlContent],
  )

  useEffect(() => {
    if (!isHtmlContent) {
      setSpreadIndex(0)
      return
    }

    const { content: chapterContent } = extractChapterTitle(content, title)
    const { pages: chapterPages } = paginateBookContent(chapterContent)
    const spreadCount = Math.max(1, Math.ceil(chapterPages.length / 2))
    setSpreadIndex(openLastSpread ? spreadCount - 1 : 0)
  }, [content, title, openLastSpread, isHtmlContent])

  const handleBookClick = useCallback(
    (event) => {
      if (event.target.closest('.flip-book-nav')) {
        return
      }

      const link = event.target.closest('[data-goto]')
      if (!link) {
        return
      }

      const goTo = link.getAttribute('data-goto')
      const spread = goToSpreadIndex[goTo]
      if (spread != null) {
        event.preventDefault()
        setSpreadIndex(spread)
      }
    },
    [goToSpreadIndex],
  )

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!event.target.closest('.flip-book')) {
        return
      }

      handleBookClick(event)
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [handleBookClick])

  const leftPageIndex = spreadIndex * 2
  const rightPageIndex = leftPageIndex + 1
  const totalPages = isHtmlContent ? pages.length : 1
  const spreadCount = Math.max(1, Math.ceil(totalPages / 2))

  const canGoBack = spreadIndex > 0 || hasPrevChapter || canGoBackToContents
  const canGoForward = spreadIndex < spreadCount - 1 || hasNextChapter || canGoToContents

  const handlePrev = () => {
    if (spreadIndex > 0) {
      setSpreadIndex((index) => index - 1)
      return
    }

    if (hasPrevChapter) {
      onPrevChapter?.()
      return
    }

    if (canGoBackToContents) {
      onGoToContents?.()
    }
  }

  const handleNext = () => {
    if (spreadIndex < spreadCount - 1) {
      setSpreadIndex((index) => index + 1)
      return
    }

    if (hasNextChapter) {
      onNextChapter?.()
      return
    }

    if (canGoToContents) {
      onGoToContents?.()
    }
  }

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
        onClick={handlePrev}
        aria-label="Предыдущая страница"
      >
        <img src={flipNavImage} alt="" className="flip-book-nav-image" />
      </button>

      <button
        type="button"
        className="flip-book-nav flip-book-nav--next"
        disabled={!canGoForward}
        onClick={handleNext}
        aria-label="Следующая страница"
      >
        <img src={flipNavImage} alt="" className="flip-book-nav-image" />
      </button>
    </Book>
  )
}

export default FlipBook
