import { useEffect, useMemo, useState } from 'react'
import './DivImage.css'

function toOffset(value) {
  if (value === undefined || value === null) {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

function DivImage({
  src,
  children,
  className = '',
  style = {},
  width,
  height,
  top,
  left,
  right,
  bottom,
  unsetSize = false,
  ...restProps
}) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (unsetSize || !src) {
      setSize({ width: 0, height: 0 })
      return
    }

    const image = new Image()
    image.onload = () => {
      setSize({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.src = src
  }, [src, unsetSize])

  const isPositioned = top != null || left != null || right != null || bottom != null

  const mergedStyle = useMemo(
    () => ({
      width: width != null ? toOffset(width) : !unsetSize && size.width ? `${size.width}px` : undefined,
      height: height != null ? toOffset(height) : !unsetSize && size.height ? `${size.height}px` : undefined,
      backgroundImage: src ? `url("${src}")` : undefined,
      ...(isPositioned && {
        position: 'absolute',
        top: toOffset(top),
        left: toOffset(left),
        right: toOffset(right),
        bottom: toOffset(bottom),
      }),
      ...style,
    }),
    [bottom, height, isPositioned, left, right, size.height, size.width, src, style, top, unsetSize, width],
  )

  const mergedClassName = ['div-image', className].filter(Boolean).join(' ')

  return (
    <div className={mergedClassName} style={mergedStyle} {...restProps}>
      {children}
    </div>
  )
}

export default DivImage
