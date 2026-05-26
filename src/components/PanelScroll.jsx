import { useEffect, useRef, useState } from 'react'
import './PanelScroll.css'

const THUMB_SIZE = 100
const TRACK_DEAD_ZONE = 100

function PanelScroll({ children }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const dragOffsetRef = useRef(0)
  const isDraggingRef = useRef(false)
  const [thumbTop, setThumbTop] = useState(TRACK_DEAD_ZONE)
  const [hasOverflow, setHasOverflow] = useState(false)

  const updateThumb = () => {
    const viewport = viewportRef.current
    if (!viewport) return

    const maxScroll = viewport.scrollHeight - viewport.clientHeight
    const overflow = maxScroll > 0
    setHasOverflow(overflow)

    if (!overflow) {
      setThumbTop(TRACK_DEAD_ZONE)
      return
    }

    const activeTrackHeight = Math.max(viewport.clientHeight - TRACK_DEAD_ZONE * 2, 0)
    const maxThumbTop = Math.max(activeTrackHeight - THUMB_SIZE, 0)
    const progress = viewport.scrollTop / maxScroll
    setThumbTop(TRACK_DEAD_ZONE + progress * maxThumbTop)
  }

  const scrollToThumbPosition = (nextThumbTop) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const maxScroll = viewport.scrollHeight - viewport.clientHeight
    if (maxScroll <= 0) return

    const activeTrackHeight = Math.max(viewport.clientHeight - TRACK_DEAD_ZONE * 2, 0)
    const maxThumbTop = Math.max(activeTrackHeight - THUMB_SIZE, 0)
    const nextActiveTop = nextThumbTop - TRACK_DEAD_ZONE
    const clampedActiveTop = Math.min(Math.max(nextActiveTop, 0), maxThumbTop)
    const progress = maxThumbTop === 0 ? 0 : clampedActiveTop / maxThumbTop
    viewport.scrollTop = progress * maxScroll
    setThumbTop(TRACK_DEAD_ZONE + clampedActiveTop)
  }

  const handleTrackMouseDown = (event) => {
    const track = trackRef.current
    if (!track) return

    const rect = track.getBoundingClientRect()
    const nextThumbTop = event.clientY - rect.top - THUMB_SIZE / 2
    scrollToThumbPosition(nextThumbTop)
  }

  const handleThumbMouseDown = (event) => {
    event.preventDefault()
    const track = trackRef.current
    if (!track) return

    const rect = track.getBoundingClientRect()
    dragOffsetRef.current = event.clientY - rect.top - thumbTop
    isDraggingRef.current = true
  }

  useEffect(() => {
    updateThumb()
    const viewport = viewportRef.current
    if (!viewport) return

    const observer = new ResizeObserver(() => updateThumb())
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [children])

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isDraggingRef.current) return
      const track = trackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const nextThumbTop = event.clientY - rect.top - dragOffsetRef.current
      scrollToThumbPosition(nextThumbTop)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div className="panel-scroll-wrap">
      <div ref={viewportRef} className="timeline-panel-scroll-viewport" onScroll={updateThumb}>
        {children}
      </div>
      {hasOverflow ? (
        <div
          ref={trackRef}
          className="timeline-panel-scroll-track"
          onMouseDown={handleTrackMouseDown}
        >
          <div
            className="timeline-panel-scroll-thumb"
            style={{ height: `${THUMB_SIZE}px`, top: `${thumbTop}px` }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      ) : null}
    </div>
  )
}

export default PanelScroll
