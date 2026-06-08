import PageTextTitle from '../components/PageTextTitle'
import RoutePlate from '../components/RoutePlate'
import DivImage from '../components/DivImage'
import AbsoluteImage from '../components/AbsoluteImage'
import routesParchmentBg from '../assets/Фон пергамент.png'
import mapImage from '../assets/3-routes/Карта Крыма.png'
import studentImage from '../assets/3-routes/студентка РЭУ.png'
import textPlateImage from '../assets/3-routes/плашка текст.png'
import './Routes.css'

const routeImages = import.meta.glob('../assets/3-routes/data/*', {
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
      <PageTextTitle>Маршруты народов Крыма</PageTextTitle>
      <DivImage src={routesParchmentBg} className="routes-background" width={1637} height={958}>
        <AbsoluteImage src={mapImage} top={150} left={40} alt="Карта Крыма" />
        <DivImage src={textPlateImage} className="routes-text-plate" bottom={40} left={75}>
          Привет! Меня зовут Надя. Я - студентка Российского экономического университета им. Г. В. Плеханова. Слышишь? Это песнь ветра и шум прибоя. Крым зовет нас!  Давай познакомимся с его историей! Выбери народ, о котором хочешь узнать больше.
        </DivImage>
        <AbsoluteImage src={studentImage} bottom={0} left={895} alt="" />
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
