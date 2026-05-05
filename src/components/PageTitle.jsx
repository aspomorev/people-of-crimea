import BackButton from './BackButton'
import './PageTitle.css'

function PageTitle({ imageSrc, imageAlt = 'Page title' }) {
  return (
    <div className="page-title">
      <div className="page-title-back">
        <BackButton />
      </div>
      {imageSrc ? <img src={imageSrc} alt={imageAlt} className="page-title-image" /> : null}
    </div>
  )
}

export default PageTitle
