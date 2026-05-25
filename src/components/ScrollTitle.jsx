import emptyScrollImage from '../assets/свиток пустой.png'
import DivImage from './DivImage'
import './ScrollTitle.css'

function ScrollTitle({ children }) {
  return (
    <DivImage src={emptyScrollImage} className="page-title-scroll">
      {children}
    </DivImage>
  )
}

export default ScrollTitle
