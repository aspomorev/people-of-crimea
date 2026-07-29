import DivImage from './DivImage'
import './LandmarkPlate.css'

function LandmarkPlate({ name, imageSrc }) {
  const title = (
    <div className="landmark-plate-name">
      <div>{name.toUpperCase()}</div>
    </div>
  )

  if (!imageSrc) {
    return (
      <div className="landmark-plate landmark-plate_no-image">
        {title}
      </div>
    )
  }

  return (
    <DivImage src={imageSrc} className="landmark-plate">
      {title}
    </DivImage>
  )
}

export default LandmarkPlate
