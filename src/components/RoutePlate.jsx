import './RoutePlate.css'

function RoutePlate({ id, name, imageSrc }) {
  return (
    <div className="route-plate" style={{ backgroundImage: `url("${imageSrc}")` }}>
      <div className="route-plate-name"><div>{name.toUpperCase()}</div></div>
      <div className="route-plate-actions">
        <button type="button" className="route-plate-action-button">
          МАРШРУТ
        </button>
        <button type="button" className="route-plate-action-button">
          ИСТОРИЯ
        </button>
      </div>
    </div>
  )
}

export default RoutePlate
