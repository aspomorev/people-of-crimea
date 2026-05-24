import BackButton from './BackButton'
import emptyScrollImage from '../assets/свиток пустой.png'
import './PageTextTitle.css'
import DivImage from './DivImage'

function PageTextTitle({ children }) {
  return (
    <div className="page-title">
      <div className="page-title-back">
        <BackButton />
      </div>
      <DivImage src={emptyScrollImage} className="page-title-scroll">
        {children}
      </DivImage>
      {/* <div className="page-title-banner">
        <img src={emptyScrollImage} alt="" className="page-title-image" />
        <div className="page-title-text">{children}</div>
      </div> */}
    </div>
  )
}

export default PageTextTitle

