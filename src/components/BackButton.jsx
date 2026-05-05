import { useNavigate } from 'react-router-dom'
import './BackButton.css'
import backArrowImage from '../assets/стрелка НАЗАД.png'

function BackButton() {
  const navigate = useNavigate()
  const handleBack = () => {
    const historyIndex = window.history.state?.idx ?? 0

    if (historyIndex > 0) {
      navigate(-1)
      return
    }

    navigate('/')
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
