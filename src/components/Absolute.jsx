import './Absolute.css'

function toOffset(value) {
  if (value === undefined || value === null) {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

function Absolute({
  children,
  className = '',
  top,
  left,
  right,
  bottom,
  style = {},
  ...restProps
}) {
  const mergedStyle = {
    top: toOffset(top),
    left: toOffset(left),
    right: toOffset(right),
    bottom: toOffset(bottom),
    ...style,
  }

  const mergedClassName = ['absolute', className].filter(Boolean).join(' ')

  return (
    <div className={mergedClassName} style={mergedStyle} {...restProps}>
      {children}
    </div>
  )
}

export default Absolute
