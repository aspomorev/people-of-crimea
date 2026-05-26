import './ConcreteRouteMap.css'

import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Absolute from '../components/Absolute'
import AbsoluteImage from '../components/AbsoluteImage'
import mapImage from '../assets/4-concrete-route-map/empty-map.png'
import ScrollTitle from '../components/ScrollTitle'
import BackButton from '../components/BackButton'
import DivImage from '../components/DivImage'
import peopleNamePlateImage from '../assets/4-concrete-route-map/people-name-plate.png'
import coordinatesCsv from '../assets/4-concrete-route-map/coordinates.csv?raw'

const routeImageModules = import.meta.glob('../assets/4-concrete-route-map/routes/**/*.{png,jpg,jpeg,webp,svg,gif}', {
  eager: true,
  import: 'default',
})

function getRouteImage(peopleName) {
  if (!peopleName) {
    return undefined
  }

  const matches = Object.entries(routeImageModules).filter(([path]) => path.includes(peopleName))

  return (
    matches.find(([path]) => /\/route\.[^/]+$/.test(path))?.[1]
    ?? matches.find(([path]) => path.includes(`/routes/${peopleName}.`))?.[1]
    ?? matches[0]?.[1]
  )
}

function parseCoordinatesCsv(csv) {
  const [headerLine, ...rows] = csv.trim().split('\n')
  const headers = headerLine.split(';')

  return rows.reduce((map, row) => {
    const values = row.split(';')
    const city = values[headers.indexOf('city')]
    const mapX = Number(values[headers.indexOf('mapX')])
    const mapY = Number(values[headers.indexOf('mapY')])

    if (city && Number.isFinite(mapX) && Number.isFinite(mapY)) {
      map.set(city, { mapX, mapY })
    }

    return map
  }, new Map())
}

const coordinatesByCity = parseCoordinatesCsv(coordinatesCsv)

const cityHtmlModules = import.meta.glob('../assets/5-concrete-route-city/*/*.html')

function getCitiesForPeople(peopleName) {
  const cityNamesForPeople = new Set(
    Object.keys(cityHtmlModules)
      .map((path) => {
        const match = path.match(/\/5-concrete-route-city\/([^/]+)\/([^/]+)\.html$/)
        if (!match || match[1] !== peopleName) {
          return null
        }

        return match[2]
      })
      .filter(Boolean),
  )

  return [...coordinatesByCity.keys()].filter((city) => cityNamesForPeople.has(city))
}

const ConcreteRouteMap = () => {
  const navigate = useNavigate()
  const { people } = useParams()

  const peopleName = useMemo(() => {
    if (!people) {
      return ''
    }

    return decodeURIComponent(people)
  }, [people])

  const routeImage = useMemo(() => getRouteImage(peopleName), [peopleName])

  const cityMarkers = useMemo(() => {
    if (!peopleName) {
      return []
    }

    return getCitiesForPeople(peopleName)
      .map((cityName) => {
        const coordinates = coordinatesByCity.get(cityName)
        if (!coordinates) {
          return null
        }

        return {
          cityName,
          mapX: coordinates.mapX,
          mapY: coordinates.mapY,
        }
      })
      .filter(Boolean)
  }, [peopleName])

  return (
    <>
      <AbsoluteImage src={mapImage} width={1920} height={1080} />
      <AbsoluteImage src={routeImage} width={1920} height={1080} />
      {cityMarkers.map(({ cityName, mapX, mapY }) => (
        <Absolute key={cityName} fromCenter top={mapY} left={mapX} className="route-map-city-marker-wrap">
          <button
            type="button"
            className="route-map-city-marker"
            aria-label={cityName}
            onClick={() =>
              navigate(`/concrete-route-map/${encodeURIComponent(peopleName)}/${encodeURIComponent(cityName)}`)
            }
          />
        </Absolute>
      ))}
      <Absolute fromCenter top={156} left={188}>
        <BackButton />
      </Absolute>
      <Absolute fromCenter top={156} left={1535}>
        <ScrollTitle>Маршруты народов Крыма</ScrollTitle>
      </Absolute>
      <Absolute fromCenter top={290} left={1535} >
        <DivImage src={peopleNamePlateImage} className="people-name-plate">{peopleName}</DivImage>
      </Absolute>
    </>
  )
}

export default ConcreteRouteMap