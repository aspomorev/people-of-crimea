import { useState } from 'react'
import './PagedList.css'

function PagedList({
  nextSrc,
  itemsSrc = [],
  child,
  itemsPerPage = 3,
  className = '',
  prevAriaLabel = 'Показать предыдущие элементы',
  nextAriaLabel = 'Показать следующие элементы',
}) {
  const [offset, setOffset] = useState(0)
  const maxOffset =
    itemsSrc.length > itemsPerPage
      ? Math.floor((itemsSrc.length - 1) / itemsPerPage) * itemsPerPage
      : 0
  const visibleItems = itemsSrc.slice(offset, offset + itemsPerPage)
  const canScrollUp = offset > 0
  const canScrollDown = offset < maxOffset
  const hasPagination = itemsSrc.length > itemsPerPage
  const itemSlots = Array.from(
    { length: itemsPerPage },
    (_, index) => visibleItems[index] ?? null,
  )

  return (
    <div className={`panel-list paged-list ${className}`.trim()}>
      {hasPagination && (
        <button
          type="button"
          className={`paged-list-nav paged-list-nav--up${canScrollUp ? '' : ' paged-list-nav--hidden'}`}
          aria-label={prevAriaLabel}
          aria-hidden={!canScrollUp}
          tabIndex={canScrollUp ? 0 : -1}
          disabled={!canScrollUp}
          onClick={() =>
            setOffset((currentOffset) =>
              Math.max(currentOffset - itemsPerPage, 0),
            )
          }
        >
          <img
            src={nextSrc}
            alt=""
            className="paged-list-nav-image paged-list-nav-image--up"
          />
        </button>
      )}
      <div className="paged-list-items">
        {itemSlots.map((item, index) =>
          item ? (
            child(item, offset + index)
          ) : (
            <div
              key={`paged-list-empty-${offset + index}`}
              className="paged-list-item-slot"
              aria-hidden="true"
            />
          ),
        )}
      </div>
      {hasPagination && (
        <button
          type="button"
          className={`paged-list-nav paged-list-nav--down${canScrollDown ? '' : ' paged-list-nav--hidden'}`}
          aria-label={nextAriaLabel}
          aria-hidden={!canScrollDown}
          tabIndex={canScrollDown ? 0 : -1}
          disabled={!canScrollDown}
          onClick={() =>
            setOffset((currentOffset) =>
              Math.min(currentOffset + itemsPerPage, maxOffset),
            )
          }
        >
          <img src={nextSrc} alt="" className="paged-list-nav-image" />
        </button>
      )}
    </div>
  )
}

export default PagedList
