import { useNavigate } from 'react-router-dom'
import './BackButton.css'
import backArrowImage from '../assets/стрелка НАЗАД.png'

function BackButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className="back-button"
      onClick={() => navigate(-1)}
      aria-label="Вернуться на предыдущую страницу"
    >
      <img src={backArrowImage} alt="" className="back-button-image" />
    </button>
  )
}

export default BackButton
