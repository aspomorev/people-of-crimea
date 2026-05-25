import BackButton from './BackButton'
import ScrollTitle from './ScrollTitle'

function PageTextTitle({ children }) {
  return (
    <div className="page-title">
      <div className="page-title-back">
        <BackButton />
      </div>
      <ScrollTitle>{children}</ScrollTitle>
    </div>
  )
}

export default PageTextTitle
