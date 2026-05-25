import './ConcreteRouteMap.css'

import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Absolute from '../components/Absolute'
import AbsoluteImage from '../components/AbsoluteImage'
import MapImage from '../assets/4-concrete-route-map/empty-map.png'
import ScrollTitle from '../components/ScrollTitle'
import BackButton from '../components/BackButton'
import DivImage from '../components/DivImage'
import PeopleNamePlate from '../assets/4-concrete-route-map/people-name-plate.png'

const routeImageModules = import.meta.glob('../assets/4-concrete-route-map/routes/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})


const routeImagesByName = new Map(
  Object.entries(routeImageModules).map(([path, imageSrc]) => {
    const fileName = path.split('/').pop() ?? ''
    const name = fileName.replace(/\.[^/.]+$/, '')
    return [name, imageSrc]
  }),
)

const ConcreteRouteMap = () => {
  const { people } = useParams()

  const peopleName = useMemo(() => {
    if (!people) {
      return ''
    }

    return decodeURIComponent(people)
  }, [people])

  const routeImage = peopleName ? routeImagesByName.get(peopleName) : undefined

  return (
    <>
      <AbsoluteImage src={MapImage} width={1920} height={1080} />
      <AbsoluteImage src={routeImage} width={1920} height={1080} />
      <Absolute fromCenter top={156} left={188}>
        <BackButton />
      </Absolute>
      <Absolute fromCenter top={156} left={1535}>
        <ScrollTitle>Маршруты народов Крыма</ScrollTitle>
      </Absolute>
      <Absolute fromCenter top={290} left={1535} >
        <DivImage src={PeopleNamePlate} className="people-name-plate">{peopleName}</DivImage>
      </Absolute>
    </>
  )
}

export default ConcreteRouteMap