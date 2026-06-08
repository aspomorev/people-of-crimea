import mainButtons from '../assets/1-main-page/Главные кнопки.png'
import centerImage from '../assets/background/Этнокультурный код Крыма.png'
import Absolute from '../components/Absolute'
import { useNavigate } from 'react-router-dom'
import './Main.css'
import DivImage from '../components/DivImage'

const menuButtons = [
  { id: 'timeline', title: 'Лента<br />времени', left: 234 },
  { id: 'routes', title: 'Маршруты<br /> народов<br />Крыма', left: 577 },
  { id: 'modern', title: 'Современная<br /> этника<br />Крыма', left: 912 },
]

function Main() {
  const navigate = useNavigate()

  const handleMainMenuClick = (buttonId) => {
    if (buttonId === 'timeline') {
      navigate('/timeline')
    } else if (buttonId === 'routes') {
      navigate('/routes')
    } else if (buttonId === 'modern') {
      navigate('/modern-ethnicity')
    }
  }

  return (
    <div className="main-page">
      <Absolute className="title" left="50%">
        <img src={centerImage} alt="" />
      </Absolute>
      <DivImage src={mainButtons} className="menu-buttons" left="50%" bottom={245} fromCenterX fromCenterY>
        {menuButtons.map((button) => (
          <button
            key={button.id}
            type="button"
            className="menu-button menu-button--main"
            style={{ left: button.left }}
            onClick={() => handleMainMenuClick(button.id)}
          >
            <span dangerouslySetInnerHTML={{ __html: button.title }} />
          </button>
        ))}
      </DivImage>
    </div>
  )
}

export default Main
