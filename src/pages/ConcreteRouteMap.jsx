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
import constants from '../assets/constants.json'
import coordinatesCsv from '../assets/4-concrete-route-map/coordinates.csv?raw'

const PERSON_X_OFFSET = constants.CONCRETE_ROUTE_MAP?.PERSON_OFFSET_X ?? 0
const PERSON_Y_OFFSET = constants.CONCRETE_ROUTE_MAP?.PERSON_OFFSET_Y ?? 43
const PERSON_MOVE_SPEED = constants.CONCRETE_ROUTE_MAP?.PERSON_MOVE_SPEED ?? 380

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
const cityLandmarkModules = import.meta.glob('../assets/5-concrete-route-city/data/*/*/*/content.html')

function getCitiesForPeople(peopleName) {
  const cityNamesForPeople = new Set()

  for (const path of Object.keys(cityHtmlModules)) {
    const match = path.match(/\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\.html$/)
    if (match?.[1] === peopleName) {
      cityNamesForPeople.add(match[2])
    }
  }

  for (const path of Object.keys(cityLandmarkModules)) {
    const match = path.match(/\/5-concrete-route-city\/data\/([^/]+)\/([^/]+)\/[^/]+\/content\.html$/)
    if (match?.[1] === peopleName) {
      cityNamesForPeople.add(match[2])
    }
  }

  return [...coordinatesByCity.keys()].filter((city) => cityNamesForPeople.has(city))
}

function getPersonAnchor(marker) {
  return {
    x: marker.mapX + PERSON_X_OFFSET,
    y: marker.mapY - PERSON_Y_OFFSET,
  }
}

function getCityPersonAnchor(cityName) {
  const coordinates = coordinatesByCity.get(cityName)
  if (!coordinates) {
    return null
  }

  return {
    x: coordinates.mapX + PERSON_X_OFFSET,
    y: coordinates.mapY - PERSON_Y_OFFSET,
  }
}

function findDirectPathCoordinates(cityA, cityB) {
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

function buildEdgePolyline(fromCity, toCity) {
  const waypoints = findDirectPathCoordinates(fromCity, toCity)
  const endAnchor = getCityPersonAnchor(toCity)
  if (!waypoints || !endAnchor) {
    return null
  }

  const startAnchor = getCityPersonAnchor(fromCity)
  const points = startAnchor
    ? [startAnchor, ...waypoints, endAnchor]
    : [...waypoints, endAnchor]

  return {
    waypoints,
    endAnchor,
    length: getPolylineLength(points),
  }
}

function buildPathGraph() {
  const adjacency = new Map()

  const addEdge = (fromCity, toCity) => {
    const edge = buildEdgePolyline(fromCity, toCity)
    if (!edge) {
      return
    }

    if (!adjacency.has(fromCity)) {
      adjacency.set(fromCity, [])
    }

    adjacency.get(fromCity).push({
      to: toCity,
      waypoints: edge.waypoints,
      endAnchor: edge.endAnchor,
      length: edge.length,
    })
  }

  for (const path of pathData.paths ?? []) {
    addEdge(path.city1, path.city2)
    addEdge(path.city2, path.city1)
  }

  return adjacency
}

const pathGraph = buildPathGraph()

function findCityRoute(fromCity, toCity, allowedCities) {
  if (!fromCity || !toCity || fromCity === toCity) {
    return null
  }

  if (allowedCities && (!allowedCities.has(fromCity) || !allowedCities.has(toCity))) {
    return null
  }

  if (!pathGraph.has(fromCity)) {
    return null
  }

  const distances = new Map([[fromCity, 0]])
  const previous = new Map()
  const queue = [fromCity]

  while (queue.length > 0) {
    queue.sort((a, b) => (distances.get(a) ?? Infinity) - (distances.get(b) ?? Infinity))
    const current = queue.shift()
    if (current === toCity) {
      break
    }

    const currentDistance = distances.get(current) ?? Infinity
    for (const edge of pathGraph.get(current) ?? []) {
      if (allowedCities && !allowedCities.has(edge.to)) {
        continue
      }

      const nextDistance = currentDistance + edge.length
      if (nextDistance >= (distances.get(edge.to) ?? Infinity)) {
        continue
      }

      distances.set(edge.to, nextDistance)
      previous.set(edge.to, current)
      if (!queue.includes(edge.to)) {
        queue.push(edge.to)
      }
    }
  }

  if (!previous.has(toCity) && fromCity !== toCity) {
    return null
  }

  const route = [toCity]
  let cursor = toCity
  while (cursor !== fromCity) {
    const prev = previous.get(cursor)
    if (!prev) {
      return null
    }
    route.push(prev)
    cursor = prev
  }

  return route.reverse()
}

function getEdgeWaypoints(fromCity, toCity) {
  const edge = (pathGraph.get(fromCity) ?? []).find((item) => item.to === toCity)
  return edge?.waypoints ?? null
}

function getEdgePolyline(fromCity, toCity) {
  const startAnchor = getCityPersonAnchor(fromCity)
  const endAnchor = getCityPersonAnchor(toCity)
  const waypoints = getEdgeWaypoints(fromCity, toCity)
  if (!startAnchor || !endAnchor || !waypoints) {
    return null
  }

  return [startAnchor, ...waypoints, endAnchor]
}

function buildCityRoutePoints(fromCity, toCity, toPos, allowedCities) {
  const cityRoute = findCityRoute(fromCity, toCity, allowedCities)
  if (!cityRoute || cityRoute.length < 2) {
    return null
  }

  const points = []

  for (let i = 1; i < cityRoute.length; i += 1) {
    const segmentFrom = cityRoute[i - 1]
    const segmentTo = cityRoute[i]
    const waypoints = getEdgeWaypoints(segmentFrom, segmentTo) ?? []
    const isLast = i === cityRoute.length - 1

    points.push(...waypoints)

    if (isLast) {
      points.push(toPos)
    } else {
      const midAnchor = getCityPersonAnchor(segmentTo)
      if (midAnchor) {
        points.push(midAnchor)
      }
    }
  }

  return points
}

function getDistanceAlongPolyline(points, targetDistance) {
  return getPointAlongPolyline(points, targetDistance)
}

function projectPointOntoPolyline(point, points) {
  if (!points?.length) {
    return null
  }

  if (points.length === 1) {
    return {
      point: points[0],
      distanceAlong: 0,
      totalLength: 0,
      distance: getSegmentLength(point, points[0]),
    }
  }

  let best = null
  let distanceAlongStart = 0

  for (let i = 1; i < points.length; i += 1) {
    const start = points[i - 1]
    const end = points[i]
    const segmentLength = getSegmentLength(start, end)
    const dx = end.x - start.x
    const dy = end.y - start.y

    let t = 0
    if (segmentLength > 0) {
      t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (segmentLength * segmentLength)
      t = Math.max(0, Math.min(1, t))
    }

    const projected = {
      x: start.x + dx * t,
      y: start.y + dy * t,
    }
    const distance = getSegmentLength(point, projected)
    const distanceAlong = distanceAlongStart + segmentLength * t

    if (!best || distance < best.distance) {
      best = {
        point: projected,
        distanceAlong,
        distance,
      }
    }

    distanceAlongStart += segmentLength
  }

  return {
    ...best,
    totalLength: distanceAlongStart,
  }
}

function slicePolylineForward(points, fromDistance) {
  if (!points?.length) {
    return []
  }

  const totalLength = getPolylineLength(points)
  const startDistance = Math.max(0, Math.min(fromDistance, totalLength))
  const startPoint = getDistanceAlongPolyline(points, startDistance)
  const result = [startPoint]
  let accrued = 0

  for (let i = 1; i < points.length; i += 1) {
    const start = points[i - 1]
    const end = points[i]
    const segmentLength = getSegmentLength(start, end)
    const nextAccrued = accrued + segmentLength

    if (nextAccrued > startDistance + 0.01) {
      result.push(end)
    }

    accrued = nextAccrued
  }

  return result
}

function slicePolylineBackward(points, fromDistance) {
  const reversed = [...points].reverse()
  const totalLength = getPolylineLength(points)
  const distanceFromEnd = Math.max(0, totalLength - fromDistance)
  return slicePolylineForward(reversed, distanceFromEnd)
}

function findNearestCity(point, allowedCities, maxDistance = 40) {
  let nearest = null

  for (const cityName of pathGraph.keys()) {
    if (allowedCities && !allowedCities.has(cityName)) {
      continue
    }

    const anchor = getCityPersonAnchor(cityName)
    if (!anchor) {
      continue
    }

    const distance = getSegmentLength(point, anchor)
    if (distance > maxDistance) {
      continue
    }

    if (!nearest || distance < nearest.distance) {
      nearest = { cityName, distance }
    }
  }

  return nearest?.cityName ?? null
}

function getUniqueUndirectedEdges(allowedCities) {
  const edges = []
  const seen = new Set()

  for (const [fromCity, neighbors] of pathGraph.entries()) {
    if (allowedCities && !allowedCities.has(fromCity)) {
      continue
    }

    for (const { to: toCity } of neighbors) {
      if (allowedCities && !allowedCities.has(toCity)) {
        continue
      }

      const key = [fromCity, toCity].sort((a, b) => a.localeCompare(b, 'ru')).join('|')
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      edges.push([fromCity, toCity])
    }
  }

  return edges
}

function buildMovePointsFromPosition(fromPos, toCity, toPos, allowedCities) {
  const nearbyCity = findNearestCity(fromPos, allowedCities)
  if (nearbyCity) {
    if (nearbyCity === toCity) {
      return [toPos]
    }

    return buildCityRoutePoints(nearbyCity, toCity, toPos, allowedCities) ?? [toPos]
  }

  let bestOption = null

  for (const [cityA, cityB] of getUniqueUndirectedEdges(allowedCities)) {
    const polyline = getEdgePolyline(cityA, cityB)
    if (!polyline) {
      continue
    }

    const projection = projectPointOntoPolyline(fromPos, polyline)
    if (!projection || projection.distance > 80) {
      continue
    }

    const routeViaA = cityA === toCity ? [] : buildCityRoutePoints(cityA, toCity, toPos, allowedCities)
    const routeViaB = cityB === toCity ? [] : buildCityRoutePoints(cityB, toCity, toPos, allowedCities)

    const towardA = slicePolylineBackward(polyline, projection.distanceAlong)
    const towardB = slicePolylineForward(polyline, projection.distanceAlong)

    const optionViaAPoints = [
      ...towardA.slice(1),
      ...(cityA === toCity ? [toPos] : (routeViaA ?? [toPos])),
    ]
    const optionViaBPoints = [
      ...towardB.slice(1),
      ...(cityB === toCity ? [toPos] : (routeViaB ?? [toPos])),
    ]

    const lengthViaA = getSegmentLength(fromPos, projection.point)
      + getPolylineLength([projection.point, ...optionViaAPoints])
    const lengthViaB = getSegmentLength(fromPos, projection.point)
      + getPolylineLength([projection.point, ...optionViaBPoints])

    if (routeViaA || cityA === toCity) {
      if (!bestOption || lengthViaA < bestOption.length) {
        bestOption = {
          length: lengthViaA,
          points: [projection.point, ...optionViaAPoints],
        }
      }
    }

    if (routeViaB || cityB === toCity) {
      if (!bestOption || lengthViaB < bestOption.length) {
        bestOption = {
          length: lengthViaB,
          points: [projection.point, ...optionViaBPoints],
        }
      }
    }
  }

  if (bestOption) {
    return bestOption.points
  }

  let nearestCity = null
  for (const cityName of pathGraph.keys()) {
    if (allowedCities && !allowedCities.has(cityName)) {
      continue
    }

    const anchor = getCityPersonAnchor(cityName)
    if (!anchor) {
      continue
    }
    const distance = getSegmentLength(fromPos, anchor)
    if (!nearestCity || distance < nearestCity.distance) {
      nearestCity = { cityName, distance, anchor }
    }
  }

  if (!nearestCity) {
    return [toPos]
  }

  if (nearestCity.cityName === toCity) {
    return [toPos]
  }

  const rest = buildCityRoutePoints(nearestCity.cityName, toCity, toPos, allowedCities)
  return rest ? [nearestCity.anchor, ...rest] : [toPos]
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

function getPersonCityStorageKey(peopleName) {
  return `route-map-person-city:${peopleName}`
}

function readSavedPersonCity(peopleName) {
  if (!peopleName) {
    return null
  }

  try {
    return sessionStorage.getItem(getPersonCityStorageKey(peopleName))
  } catch {
    return null
  }
}

function savePersonCity(peopleName, cityName) {
  if (!peopleName || !cityName) {
    return
  }

  try {
    sessionStorage.setItem(getPersonCityStorageKey(peopleName), cityName)
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
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

  const allowedCities = useMemo(
    () => new Set(cityMarkers.map((marker) => marker.cityName)),
    [cityMarkers],
  )

  const [personPos, setPersonPos] = useState(null)
  const [isMoving, setIsMoving] = useState(false)
  const [facingLeft, setFacingLeft] = useState(false)

  const personCityNameRef = useRef(null)
  const targetCityNameRef = useRef(null)
  const isMovingRef = useRef(false)
  const personPosRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (!cityMarkers.length) {
      personCityNameRef.current = null
      targetCityNameRef.current = null
      isMovingRef.current = false
      personPosRef.current = null
      setPersonPos(null)
      setIsMoving(false)
      return
    }

    const savedCityName = readSavedPersonCity(peopleName)
    const startMarker =
      cityMarkers.find((marker) => marker.cityName === savedCityName)
      ?? cityMarkers[0]

    const anchor = getPersonAnchor(startMarker)
    personCityNameRef.current = startMarker.cityName
    targetCityNameRef.current = null
    isMovingRef.current = false
    personPosRef.current = anchor
    setPersonPos(anchor)
    setIsMoving(false)
  }, [cityMarkers, peopleName])

  const movePersonToCity = (cityName) => {
    if (!cityName) {
      return
    }

    if (cityName === targetCityNameRef.current) {
      return
    }

    if (!isMovingRef.current && cityName === personCityNameRef.current) {
      return
    }

    const targetMarker = cityMarkers.find((marker) => marker.cityName === cityName)
    const fromPos = personPosRef.current
    if (!targetMarker || !fromPos) {
      return
    }

    const toPos = getPersonAnchor(targetMarker)
    const routeTail = buildMovePointsFromPosition(fromPos, cityName, toPos, allowedCities)
    const routePoints = [fromPos, ...routeTail]
    const totalLength = getPolylineLength(routePoints)
    const duration = Math.max(250, (totalLength / PERSON_MOVE_SPEED) * 1000)

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    targetCityNameRef.current = cityName
    isMovingRef.current = true
    setFacingLeft(toPos.x < fromPos.x)
    setIsMoving(true)

    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const nextPos = getPointAlongPolyline(routePoints, totalLength * progress)
      const prevPos = personPosRef.current

      if (prevPos && Math.abs(nextPos.x - prevPos.x) > 0.5) {
        setFacingLeft(nextPos.x < prevPos.x)
      }

      personPosRef.current = nextPos
      setPersonPos(nextPos)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick)
        return
      }

      animationRef.current = null
      personPosRef.current = toPos
      personCityNameRef.current = cityName
      targetCityNameRef.current = null
      isMovingRef.current = false
      savePersonCity(peopleName, cityName)
      setPersonPos(toPos)
      setIsMoving(false)
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  const openCity = (cityName) => {
    savePersonCity(peopleName, cityName)
    navigate(`/routes/map/${encodeURIComponent(peopleName)}/${encodeURIComponent(cityName)}`)
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
            onClick={() => openCity(cityName)}
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
      <Absolute fromCenter top={156} left={1550}>
        <ScrollTitle>Маршруты народов Крыма</ScrollTitle>
      </Absolute>
      <Absolute fromCenter top={290} left={1550} >
        <DivImage src={peopleNamePlateImage} className="people-name-plate">{peopleName}</DivImage>
      </Absolute>
    </>
  )
}

export default ConcreteRouteMap
