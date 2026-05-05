import timelineDefault from '../assets/1-main-page/1. НЕАКТИВ Лента времени.png'
import timelineActive from '../assets/1-main-page/1. АКТИВ Лента времени.png'
import routesDefault from '../assets/1-main-page/2. НЕАКТИВ Маршруты народов Крыма.png'
import routesActive from '../assets/1-main-page/2. АКТИВ Маршруты народов Крыма.png'
import modernDefault from '../assets/1-main-page/3. НЕАКТИВ Современная этника.png'
import modernActive from '../assets/1-main-page/3. АКТИВ Современная этника.png'
import aboutDefault from '../assets/1-main-page/НЕАКТИВ О проекте.png'
import aboutActive from '../assets/1-main-page/АКТИВ О проекте.png'
import galleryDefault from '../assets/1-main-page/НЕАКТИВ галерея.png'
import galleryActive from '../assets/1-main-page/АКТИВ галерея.png'
import contactsDefault from '../assets/1-main-page/НЕАКТИВ контакты.png'
import contactsActive from '../assets/1-main-page/АКТИВ Контакты.png'
import centerImage from '../assets/background/Этнокультурный код Крыма.png'
import { useNavigate } from 'react-router-dom'
import './Main.css'

const menuButtons = [
  { id: 'timeline', defaultSrc: timelineDefault, activeSrc: timelineActive },
  { id: 'routes', defaultSrc: routesDefault, activeSrc: routesActive },
  { id: 'modern', defaultSrc: modernDefault, activeSrc: modernActive },
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
      <img src={centerImage} alt="" className="title" />
      <div className="menu-buttons">
        {menuButtons.map((button) => (
          <button
            key={button.id}
            type="button"
            className="menu-button"
            onClick={() => handleMainMenuClick(button.id)}
          >
            <img src={button.defaultSrc} alt="" className="main-menu-image image-default" />
            <img src={button.activeSrc} alt="" className="main-menu-image image-active" />
          </button>
        ))}
      </div>

      <div className="submenu-buttons">
        {secondaryMenuButtons.map((button) => (
          <button key={button.id} type="button" className="menu-button">
            <img src={button.defaultSrc} alt="" className="main-menu-image image-default" />
            <img src={button.activeSrc} alt="" className="main-menu-image image-active" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default Main
