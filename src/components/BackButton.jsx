import { useLocation, useNavigate } from 'react-router-dom'
import { getBackPathname } from '../appRoutes'
import './BackButton.css'
import backArrowImage from '../assets/стрелка НАЗАД.png'

function BackButton() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleBack = () => {
    navigate(getBackPathname(pathname))
  }

  return (
    <button
      type="button"
      className="back-button"
      onClick={handleBack}
      aria-label="Вернуться на предыдущую страницу"
    >
      <img src={backArrowImage} alt="" className="back-button-image" />
    </button>
  )
}

export default BackButton
