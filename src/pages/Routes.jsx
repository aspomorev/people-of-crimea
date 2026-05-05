import PageTitle from '../components/PageTitle'
import RoutePlate from '../components/RoutePlate'
import routesTitleImage from '../assets/3-routes/Название Маршруты народов Крыма.png'
import routesParchmentBg from '../assets/3-routes/Фон пергамент.png'
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
      <div className="routes-background" style={{ backgroundImage: `url("${routesParchmentBg}")` }}>
        {routesData.map((routeItem) => (
          <RoutePlate key={routeItem.id} id={routeItem.id} name={routeItem.name} imageSrc={routeItem.imageSrc} />
        ))}
      </div>
    </section>
  )
}

export default Routes
