import { useEffect, useRef, useState } from 'react'
import './PanelScroll.css'

const THUMB_SIZE = 128

function PanelScroll({ children }) {
  const viewportRef = useRef(null)
  const [thumbTop, setThumbTop] = useState(0)
  const [hasOverflow, setHasOverflow] = useState(false)

  const updateThumb = () => {
    const viewport = viewportRef.current
    if (!viewport) return

    const maxScroll = viewport.scrollHeight - viewport.clientHeight
    const overflow = maxScroll > 0
    setHasOverflow(overflow)

    if (!overflow) {
      setThumbTop(0)
      return
    }

    const maxThumbTop = Math.max(viewport.clientHeight - THUMB_SIZE, 0)
    const progress = viewport.scrollTop / maxScroll
    setThumbTop(progress * maxThumbTop)
  }

  useEffect(() => {
    updateThumb()
    const viewport = viewportRef.current
    if (!viewport) return

    const observer = new ResizeObserver(() => updateThumb())
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="timeline-panel-scroll-wrap">
      <div ref={viewportRef} className="timeline-panel-scroll-viewport" onScroll={updateThumb}>
        {children}
      </div>
      {hasOverflow ? (
        <div className="timeline-panel-scroll-track">
          <div
            className="timeline-panel-scroll-thumb"
            style={{ height: `${THUMB_SIZE}px`, transform: `translateY(${thumbTop}px)` }}
          />
        </div>
      ) : null}
    </div>
  )
}

export default PanelScroll
