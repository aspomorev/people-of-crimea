import defaultBackgroundImage from '../assets/background/фон (Крым и море).png'
import bluredBackgroundImage from '../assets/background/фон .png'
import cloudImage1 from '../assets/background/облако верхнее левое.png'
import cloudImage2 from '../assets/background/облако верхнее правое.png'
import cloudImage3 from '../assets/background/облако нижнее левое.png'
import cloudImage4 from '../assets/background/облако нижнее правое.png'
import './Background.css'

const logoModules = import.meta.glob('../assets/logo/*', {
  eager: true,
  import: 'default',
})

const logos = Object.values(logoModules)

export const BACKGROUND_TYPE = {
  DEFAULT: 'default',
  BLURED: 'blured',
}

function Background({ backgroundType = BACKGROUND_TYPE.DEFAULT, showClouds = true }) {
  const backgroundImage =
    backgroundType === BACKGROUND_TYPE.BLURED ? bluredBackgroundImage : defaultBackgroundImage

  return (
    <>
      <div className="app-background" style={{ backgroundImage: `url("${backgroundImage}")` }} aria-hidden="true">
        {showClouds ? (
          <>
            <img src={cloudImage1} alt="" className="cloud cloud--top-left" />
            <img src={cloudImage2} alt="" className="cloud cloud--top-right" />
            <img src={cloudImage3} alt="" className="cloud cloud--bottom-left" />
            <img src={cloudImage4} alt="" className="cloud cloud--bottom-right" />
          </>
        ) : null}
      </div>

      <div className="background-logos" aria-hidden="true">
        {logos.map((logoSrc) => (
          <img key={logoSrc} src={logoSrc} alt="logo" className="main-logo-image" />
        ))}
      </div>
    </>
  )
}

export default Background
