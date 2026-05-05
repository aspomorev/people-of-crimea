import PageTitle from '../components/PageTitle'
import RoutePlate from '../components/RoutePlate'
import routesTitleImage from '../assets/3-routes/Название Маршруты народов Крыма.png'
import routesParchmentBg from '../assets/3-routes/Фон пергамент.png'
import routeButtonImage from '../assets/3-routes/peoples/1 Греки.png'
import './Routes.css'

function Routes() {
  return (
    <section className="routes-page">
      <PageTitle imageSrc={routesTitleImage} imageAlt="Маршруты народов Крыма" />
      <div className="routes-background" style={{ backgroundImage: `url("${routesParchmentBg}")` }}>
        <RoutePlate id="greeks" name="Греки" imageSrc={routeButtonImage} />
      </div>
    </section>
  )
}

export default Routes
