import { useEffect, useMemo, useState } from 'react'
import './DivImage.css'

function DivImage({ src, children, className = '', style = {}, ...restProps }) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!src) {
      setSize({ width: 0, height: 0 })
      return
    }

    const image = new Image()
    image.onload = () => {
      setSize({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.src = src
  }, [src])

  const mergedStyle = useMemo(
    () => ({
      width: size.width ? `${size.width}px` : undefined,
      height: size.height ? `${size.height}px` : undefined,
      backgroundImage: src ? `url("${src}")` : undefined,
      ...style,
    }),
    [size.height, size.width, src, style],
  )

  const mergedClassName = ['div-image', className].filter(Boolean).join(' ')

  return (
    <div className={mergedClassName} style={mergedStyle} {...restProps}>
      {children}
    </div>
  )
}

export default DivImage
