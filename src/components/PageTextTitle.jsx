import ScrollTitle from './ScrollTitle'
import './PageImageTitle.css'

function PageTextTitle({ children }) {
  return (
    <div className="page-title">
      <ScrollTitle>{children}</ScrollTitle>
    </div>
  )
}

export default PageTextTitle
