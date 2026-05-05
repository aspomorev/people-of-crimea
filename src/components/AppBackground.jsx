import backgroundImage from '../assets/background/фон (Крым и море).png'
import centerImage from '../assets/background/Этнокультурный код Крыма.png'
import cloudImage1 from '../assets/background/облако верхнее левое.png'
import cloudImage2 from '../assets/background/облако верхнее правое.png'
import cloudImage3 from '../assets/background/облако нижнее левое.png'
import cloudImage4 from '../assets/background/облако нижнее правое.png'

function AppBackground() {
  return (
    <div className="app-background" style={{ backgroundImage: `url("${backgroundImage}")` }} aria-hidden="true">
      <img src={centerImage} alt="" className="background-center-image" />
      <img src={cloudImage1} alt="" className="cloud cloud--top-left" />
      <img src={cloudImage2} alt="" className="cloud cloud--top-right" />
      <img src={cloudImage3} alt="" className="cloud cloud--bottom-left" />
      <img src={cloudImage4} alt="" className="cloud cloud--bottom-right" />
    </div>
  )
}

export default AppBackground
