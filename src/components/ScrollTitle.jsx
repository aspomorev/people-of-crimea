import emptyScrollImage from '../assets/свиток пустой.png'
import DivImage from './DivImage'
import './ScrollTitle.css'

function ScrollTitle({ children }) {
  return (
    <DivImage src={emptyScrollImage} className="page-title-scroll">
      <span className="page-title-scroll__text">{children}</span>
    </DivImage>
  )
}

export default ScrollTitle
