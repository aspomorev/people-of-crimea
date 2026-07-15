import './PageImageTitle.css'

function PageImageTitle({ imageSrc }) {
  return (
    <div className="page-title">
      {imageSrc ? <img src={imageSrc} className="page-title-image" alt="" /> : null}
    </div>
  )
}
export default PageImageTitle
