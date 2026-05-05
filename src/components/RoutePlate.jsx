import routeButtonImage from '../assets/3-routes/плашка.png'
import './RoutePlate.css'

function RoutePlate({ id, name, imageSrc }) {
  return (
    <div className="route-plate" style={{ backgroundImage: `url("${routeButtonImage}")` }}>
      <div className="route-plate-name">{name.toUpperCase()}</div>
      <div className="route-plate-actions">
        <button type="button" className="route-plate-action-button">
          МАРШРУТ
        </button>
        <button type="button" className="route-plate-action-button">
          ИСТОРИЯ
        </button>
      </div>
      <img src={imageSrc} alt={name.toUpperCase()} className="route-plate-img" />
    </div>
  )
}

export default RoutePlate
