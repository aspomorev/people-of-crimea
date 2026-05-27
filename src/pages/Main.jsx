import mainButtons from '../assets/1-main-page/Главные кнопки.png'
import aboutDefault from '../assets/1-main-page/НЕАКТИВ О проекте.png'
import aboutActive from '../assets/1-main-page/АКТИВ О проекте.png'
import galleryDefault from '../assets/1-main-page/НЕАКТИВ галерея.png'
import galleryActive from '../assets/1-main-page/АКТИВ галерея.png'
import contactsDefault from '../assets/1-main-page/НЕАКТИВ контакты.png'
import contactsActive from '../assets/1-main-page/АКТИВ Контакты.png'
import centerImage from '../assets/background/Этнокультурный код Крыма.png'
import Absolute from '../components/Absolute'
import { useNavigate } from 'react-router-dom'
import './Main.css'
import DivImage from '../components/DivImage'

const menuButtons = [
  { id: 'timeline', title: 'Лента<br />времени', left: 234 },
  { id: 'routes', title: 'Маршруты<br /> народов<br />Крыма', left: 577 },
  { id: 'modern', title: 'Сорвеменная<br /> этника<br />Крыма', left: 912 },
]

const secondaryMenuButtons = [
  { id: 'about', defaultSrc: aboutDefault, activeSrc: aboutActive },
  { id: 'gallery', defaultSrc: galleryDefault, activeSrc: galleryActive },
  { id: 'contacts', defaultSrc: contactsDefault, activeSrc: contactsActive },
]

function Main() {
  const navigate = useNavigate()

  const handleMainMenuClick = (buttonId) => {
    if (buttonId === 'timeline') {
      navigate('/timeline')
    } else if (buttonId === 'routes') {
      navigate('/routes')
    }
    // else if (buttonId === 'modern') {
    //   navigate('/modern')
    // } else if (buttonId === 'about') {
    //   navigate('/about')
    // } else if (buttonId === 'gallery') {
    //   navigate('/gallery')
    // } else if (buttonId === 'contacts') {
    //   navigate('/contacts')
    // }
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

      {/* <div className="submenu-buttons">
        {secondaryMenuButtons.map((button) => (
          <button key={button.id} type="button" className="menu-button">
            <img src={button.defaultSrc} alt="" className="main-menu-image image-default" />
            <img src={button.activeSrc} alt="" className="main-menu-image image-active" />
          </button>
        ))}
      </div> */}
    </div>
  )
}

export default Main
