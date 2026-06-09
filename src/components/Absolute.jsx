import './Absolute.css'

function toOffset(value) {
  if (value === undefined || value === null) {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

function buildFromCenterTransform(top, left, right, bottom, fromCenterX, fromCenterY) {
  const translateX =
    fromCenterX && left != null ? '-50%' : fromCenterX && right != null ? '50%' : '0'
  const translateY =
    fromCenterY && top != null ? '-50%' : fromCenterY && bottom != null ? '50%' : '0'

  if (translateX === '0' && translateY === '0') {
    return undefined
  }

  return `translate(${translateX}, ${translateY})`
}

function Absolute({
  children,
  className = '',
  top,
  left,
  right,
  bottom,
  fromCenter = false,
  fromCenterX = false,
  fromCenterY = false,
  style = {},
  ...restProps
}) {
  const effectiveFromCenterX = fromCenterX || fromCenter
  const effectiveFromCenterY = fromCenterY || fromCenter
  const transform = buildFromCenterTransform(
    top,
    left,
    right,
    bottom,
    effectiveFromCenterX,
    effectiveFromCenterY,
  )

  const positionStyle = {
    top: toOffset(top),
    left: toOffset(left),
    right: toOffset(right),
    bottom: toOffset(bottom),
    ...(transform && { transform }),
  }

  const mergedStyle = {
    ...style,
    ...positionStyle,
  }

  const mergedClassName = [
    'absolute',
    effectiveFromCenterX && 'absolute_from-center-x',
    effectiveFromCenterY && 'absolute_from-center-y',
    fromCenter && 'absolute_from-center',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={mergedClassName} style={mergedStyle} {...restProps}>
      {children}
    </div>
  )
}

export default Absolute
