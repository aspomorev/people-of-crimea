import PageTitle from '../components/PageTitle'
import RoutePlate from '../components/RoutePlate'
import DivImage from '../components/DivImage'
import routesTitleImage from '../assets/3-routes/Название Маршруты народов Крыма.png'
import routesParchmentBg from '../assets/3-routes/Фон пергамент.png'
import mapImage from '../assets/3-routes/Карта Крыма.png'
import studentImage from '../assets/3-routes/студентка РЭУ.png'
import textPlateImage from '../assets/3-routes/плашка текст.png'
import './Routes.css'

const routeImages = import.meta.glob('../assets/3-routes/peoples/*', {
  eager: true,
  import: 'default',
})

const routesData = Object.entries(routeImages)
  .map(([path, imageSrc]) => {
    const match = path.match(/\/(\d+)\s+(.+)\.[^.]+$/)
    if (!match) {
      return null
    }

    return {
      id: match[1],
      order: Number(match[1]),
      name: match[2],
      imageSrc,
    }
  })
  .filter(Boolean)
  .sort((a, b) => a.order - b.order)

function Routes() {
  return (
    <section className="routes-page">
      <PageTitle imageSrc={routesTitleImage} imageAlt="Маршруты народов Крыма" />
      <DivImage src={routesParchmentBg} className="routes-background">
          <img src={mapImage} alt="Карта Крыма" className="routes-map-image" />
          <img src={studentImage} className="routes-student-image" />
          <div className="routes-text-plate">
            <img src={textPlateImage} alt="" aria-hidden="true" className="routes-text-plate-probe" />
            <div className="routes-text-plate-content"></div>
          </div>
          <div className="routes-plates">
            {routesData.map((routeItem) => (
              <RoutePlate key={routeItem.id} id={routeItem.id} name={routeItem.name} imageSrc={routeItem.imageSrc} />
            ))}
          </div>
      </DivImage>
    </section>
  )
}

export default Routes
