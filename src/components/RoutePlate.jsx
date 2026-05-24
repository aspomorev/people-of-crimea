import { useNavigate } from 'react-router-dom'
import './RoutePlate.css'

function RoutePlate({ id, name, imageSrc }) {
  const navigate = useNavigate()
  return (
    <div className="route-plate" style={{ backgroundImage: `url("${imageSrc}")` }}>
      <div className="route-plate-name"><div>{name.toUpperCase()}</div></div>
      <div className="route-plate-actions">
        <button type="button" className="route-plate-action-button" onClick={() => navigate(`/concrete-route-map/${encodeURIComponent(name)}`)}>
          МАРШРУТ
        </button>
        <button
          type="button"
          className="route-plate-action-button"
          onClick={() => navigate(`/concrete-history/${encodeURIComponent(name)}`)}
        >
          ИСТОРИЯ
        </button>
      </div>
    </div>
  )
}

export default RoutePlate
