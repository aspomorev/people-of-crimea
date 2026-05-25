import BackButton from './BackButton'
import './PageImageTitle.css'

function PageImageTitle({ imageSrc }) {
  return (
    <div className="page-title">
      <div className="page-title-back">
        <BackButton />
      </div>
      {imageSrc ? <img src={imageSrc} className="page-title-image" /> : null}
    </div>
  )
}

export default PageImageTitle
