const logoModules = import.meta.glob('../assets/logo/*', {
  eager: true,
  import: 'default',
})

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

const logos = Object.values(logoModules)
const menuButtons = [
  { id: 1, defaultSrc: timelineDefault, activeSrc: timelineActive },
  { id: 2, defaultSrc: routesDefault, activeSrc: routesActive },
  { id: 3, defaultSrc: modernDefault, activeSrc: modernActive },
]

const secondaryMenuButtons = [
  { id: 'about', defaultSrc: aboutDefault, activeSrc: aboutActive },
  { id: 'gallery', defaultSrc: galleryDefault, activeSrc: galleryActive },
  { id: 'contacts', defaultSrc: contactsDefault, activeSrc: contactsActive },
]

function Main() {
  return (
    <div className="main-page">
      <div className="main-logos">
        {logos.map((logoSrc) => (
          <img key={logoSrc} src={logoSrc} alt="logo" className="main-logo-image" />
        ))}
      </div>

      <div className="main-menu-center">
        {menuButtons.map((button) => (
          <button key={button.id} type="button" className="main-menu-button">
            <img src={button.defaultSrc} alt="" className="main-menu-image main-menu-image--default" />
            <img src={button.activeSrc} alt="" className="main-menu-image main-menu-image--active" />
          </button>
        ))}
      </div>

      <div className="main-submenu-center">
        {secondaryMenuButtons.map((button) => (
          <button key={button.id} type="button" className="main-menu-button">
            <img src={button.defaultSrc} alt="" className="main-menu-image main-menu-image--default" />
            <img src={button.activeSrc} alt="" className="main-menu-image main-menu-image--active" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default Main
