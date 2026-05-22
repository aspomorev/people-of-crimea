import defaultBackgroundImage from '../assets/background/фон (Крым и море).png'
import bluredBackgroundImage from '../assets/background/фон .png'
import cloudImage1 from '../assets/background/облако верхнее левое.png'
import cloudImage2 from '../assets/background/облако верхнее правое.png'
import cloudImage3 from '../assets/background/облако нижнее левое.png'
import cloudImage4 from '../assets/background/облако нижнее правое.png'
import Absolute from './Absolute'
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
            <Absolute className="cloud" top={0} left={0}>
              <img src={cloudImage1} alt="" />
            </Absolute>
            <Absolute className="cloud" top={0} right={0}>
              <img src={cloudImage2} alt="" />
            </Absolute>
            <Absolute className="cloud" bottom={0} left={0}>
              <img src={cloudImage3} alt="" />
            </Absolute>
            <Absolute className="cloud" bottom={0} right={0}>
              <img src={cloudImage4} alt="" />
            </Absolute>
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
