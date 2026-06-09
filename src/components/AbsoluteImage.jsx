import Absolute from './Absolute'
import DivImage from './DivImage'

function AbsoluteImage({
  src,
  top,
  left,
  right,
  bottom,
  fromCenter = false,
  fromCenterX = false,
  fromCenterY = false,
  width,
  height,
  alt,
  className = '',
  imageClassName = '',
  style,
  imageStyle,
  children,
  ...restProps
}) {
  if (!src) {
    return null
  }

  const effectiveFromCenterX = fromCenterX || fromCenter
  const effectiveFromCenterY = fromCenterY || fromCenter

  return (
    <Absolute
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      fromCenter={fromCenter}
      fromCenterX={effectiveFromCenterX}
      fromCenterY={effectiveFromCenterY}
      className={className}
      style={style}
    >
      <DivImage
        src={src}
        width={width}
        height={height}
        className={imageClassName}
        style={imageStyle}
        role={alt ? 'img' : undefined}
        aria-label={alt}
        {...restProps}
      >
        {children}
      </DivImage>
    </Absolute>
  )
}

export default AbsoluteImage
