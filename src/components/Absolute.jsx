import './Absolute.css'

function toOffset(value) {
  if (value === undefined || value === null) {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

function buildFromCenterTransform(top, left, right, bottom) {
  const translateX = left != null ? '-50%' : right != null ? '50%' : '0'
  const translateY = top != null ? '-50%' : bottom != null ? '50%' : '0'

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
  style = {},
  ...restProps
}) {
  const positionStyle = fromCenter
    ? {
        top: toOffset(top),
        left: toOffset(left),
        right: toOffset(right),
        bottom: toOffset(bottom),
        transform: buildFromCenterTransform(top, left, right, bottom),
      }
    : {
        top: toOffset(top),
        left: toOffset(left),
        right: toOffset(right),
        bottom: toOffset(bottom),
      }

  const mergedStyle = {
    ...style,
    ...positionStyle,
  }

  const mergedClassName = ['absolute', fromCenter && 'absolute_from-center', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={mergedClassName} style={mergedStyle} {...restProps}>
      {children}
    </div>
  )
}

export default Absolute
