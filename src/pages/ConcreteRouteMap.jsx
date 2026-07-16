import './ConcreteRouteMap.css'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Absolute from '../components/Absolute'
import AbsoluteImage from '../components/AbsoluteImage'
import mapImage from '../assets/4-concrete-route-map/empty-map.png'
import ScrollTitle from '../components/ScrollTitle'
import DivImage from '../components/DivImage'
import peopleNamePlateImage from '../assets/4-concrete-route-map/people-name-plate.png'
import markerInactiveImage from '../assets/4-concrete-route-map/маркер неактивный.png'
import markerActiveImage from '../assets/4-concrete-route-map/маркер активный.png'
import personImage from '../assets/4-concrete-route-map/person.png'
import personMoveImage from '../assets/4-concrete-route-map/person-move.gif'
import pathData from '../assets/4-concrete-route-map/path.json'
import coordinatesCsv from '../assets/4-concrete-route-map/coordinates.csv?raw'

const PERSON_Y_OFFSET = 43
const PERSON_MOVE_SPEED = 380

const routeImageModules = import.meta.glob('../assets/4-concrete-route-map/data/**/*.{png,jpg,jpeg,webp,svg,gif}', {
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
    ?? matches.find(([path]) => path.includes(`/data/${peopleName}.`))?.[1]
    ?? matches[0]?.[1]
  )
}

function normalizeLabelColor(color) {
  if (!color) {
    return undefined
  }

  const trimmed = color.trim()
  if (trimmed.startsWith('0#')) {
    return trimmed.slice(1)
  }

  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

function parseCoordinatesCsv(csv) {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/)
  const headers = headerLine.split(';').map((header) => header.trim().replace(/^\ufeff/, ''))

  return rows.reduce((map, row) => {
    if (!row.trim()) {
      return map
    }

    const values = row.split(';').map((value) => value.trim())
    const city = values[headers.indexOf('city')]
    const mapX = Number(values[headers.indexOf('mapX')])
    const mapY = Number(values[headers.indexOf('mapY')])
    const labelX = Number(values[headers.indexOf('labelX')])
    const labelY = Number(values[headers.indexOf('labelY')])
    const labelColor = normalizeLabelColor(values[headers.indexOf('labelColor')])

    if (city && Number.isFinite(mapX) && Number.isFinite(mapY)) {
      map.set(city, {
        mapX,
        mapY,
        labelX: Number.isFinite(labelX) ? labelX : mapX,
        labelY: Number.isFinite(labelY) ? labelY : mapY,
        labelColor,
      })
    }

    return map
  }, new Map())
}

const coordinatesByCity = parseCoordinatesCsv(coordinatesCsv)

const cityHtmlModules = import.meta.glob('../assets/5-concrete-route-city/data/*/*.html')

function getCitiesForPeople(peopleName) {
  const cityNamesForPeople = new Set(
    Object.keys(cityHtmlModules)
      .map((path) => {
        const match = path.match(/\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\.html$/)
        if (!match || match[1] !== peopleName) {
          return null
        }

        return match[2]
      })
      .filter(Boolean),
  )

  return [...coordinatesByCity.keys()].filter((city) => cityNamesForPeople.has(city))
}

function getPersonAnchor(marker) {
  return {
    x: marker.mapX,
    y: marker.mapY - PERSON_Y_OFFSET,
  }
}

function findPathCoordinates(cityA, cityB) {
  for (const path of pathData.paths ?? []) {
    if (path.city1 === cityA && path.city2 === cityB) {
      return path.coordinates.map(({ x, y }) => ({ x, y }))
    }

    if (path.city1 === cityB && path.city2 === cityA) {
      return [...path.coordinates].reverse().map(({ x, y }) => ({ x, y }))
    }
  }

  return null
}

function buildMovePoints(fromCity, toCity, toPos) {
  const pathCoords = findPathCoordinates(fromCity, toCity)
  if (!pathCoords?.length) {
    return [toPos]
  }

  return [...pathCoords, toPos]
}

function getSegmentLength(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function getPolylineLength(points) {
  let length = 0
  for (let i = 1; i < points.length; i += 1) {
    length += getSegmentLength(points[i - 1], points[i])
  }
  return length
}

function getPointAlongPolyline(points, distance) {
  if (points.length === 1) {
    return points[0]
  }

  let remaining = distance

  for (let i = 1; i < points.length; i += 1) {
    const start = points[i - 1]
    const end = points[i]
    const segmentLength = getSegmentLength(start, end)

    if (remaining <= segmentLength || i === points.length - 1) {
      const t = segmentLength === 0 ? 1 : Math.min(1, remaining / segmentLength)
      return {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      }
    }

    remaining -= segmentLength
  }

  return points[points.length - 1]
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
          labelX: coordinates.labelX,
          labelY: coordinates.labelY,
          labelColor: coordinates.labelColor,
        }
      })
      .filter(Boolean)
  }, [peopleName])

  const [personPos, setPersonPos] = useState(null)
  const [isMoving, setIsMoving] = useState(false)
  const [facingLeft, setFacingLeft] = useState(false)

  const personCityNameRef = useRef(null)
  const personPosRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    const firstMarker = cityMarkers[0]
    if (!firstMarker) {
      personCityNameRef.current = null
      personPosRef.current = null
      setPersonPos(null)
      setIsMoving(false)
      return
    }

    const anchor = getPersonAnchor(firstMarker)
    personCityNameRef.current = firstMarker.cityName
    personPosRef.current = anchor
    setPersonPos(anchor)
    setIsMoving(false)
  }, [cityMarkers])

  const movePersonToCity = (cityName) => {
    if (!cityName || cityName === personCityNameRef.current) {
      return
    }

    const targetMarker = cityMarkers.find((marker) => marker.cityName === cityName)
    const fromPos = personPosRef.current
    if (!targetMarker || !fromPos) {
      return
    }

    const toPos = getPersonAnchor(targetMarker)
    const fromCity = personCityNameRef.current
    const routePoints = [fromPos, ...buildMovePoints(fromCity, cityName, toPos)]
    const totalLength = getPolylineLength(routePoints)
    const duration = Math.max(250, (totalLength / PERSON_MOVE_SPEED) * 1000)

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    personCityNameRef.current = cityName
    setFacingLeft(toPos.x < fromPos.x)
    setIsMoving(true)

    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const nextPos = getPointAlongPolyline(routePoints, totalLength * progress)

      personPosRef.current = nextPos
      setPersonPos(nextPos)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick)
        return
      }

      animationRef.current = null
      personPosRef.current = toPos
      setPersonPos(toPos)
      setIsMoving(false)
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <>
      <AbsoluteImage src={mapImage} width={1920} height={1080} />
      <AbsoluteImage src={routeImage} width={1920} height={1080} />
      {cityMarkers.map(({ cityName, mapX, mapY, labelX, labelY, labelColor }) => (
        <Absolute
          key={`label-${cityName}`}
          fromCenter
          top={labelY}
          left={labelX}
          className="route-map-city-label"
          style={{ color: labelColor }}
        >
          <span className="route-map-city-label__text" style={{ color: labelColor }}>
            {cityName}
          </span>
        </Absolute>
      ))}
      {cityMarkers.map(({ cityName, mapX, mapY }) => (
        <Absolute
          key={cityName}
          fromCenter
          top={mapY}
          left={mapX}
          className="route-map-city-marker-wrap"
          onMouseEnter={() => movePersonToCity(cityName)}
        >
          <button
            type="button"
            className="route-map-city-marker"
            aria-label={cityName}
            onClick={() =>
              navigate(`/routes/map/${encodeURIComponent(peopleName)}/${encodeURIComponent(cityName)}`)
            }
          >
            <DivImage
              src={markerInactiveImage}
              className="route-map-city-marker__image route-map-city-marker__image--inactive"
            />
            <DivImage
              src={markerActiveImage}
              className="route-map-city-marker__image route-map-city-marker__image--active"
            />
          </button>
        </Absolute>
      ))}
      {personPos ? (
        <Absolute
          top={personPos.y}
          left={personPos.x}
          className={`route-map-person${facingLeft ? ' route-map-person_facing-left' : ''}`}
        >
          <DivImage
            src={isMoving ? personMoveImage : personImage}
            className="route-map-person__image"
          />
        </Absolute>
      ) : null}
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
