import './ConcreteRouteMapAdmin.css'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Absolute from '../../components/Absolute'
import AbsoluteImage from '../../components/AbsoluteImage'
import DivImage from '../../components/DivImage'
import mapImage from '../../assets/4-concrete-route-map/empty-map.png'
import markerInactiveImage from '../../assets/4-concrete-route-map/маркер неактивный.png'
import markerActiveImage from '../../assets/4-concrete-route-map/маркер активный.png'
import coordinatesCsv from '../../assets/4-concrete-route-map/coordinates.csv?raw'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

const routeImageModules = import.meta.glob(
  '../../assets/4-concrete-route-map/data/**/*.{png,jpg,jpeg,webp,svg,gif}',
  {
    eager: true,
    import: 'default',
  },
)

const peoplePlateModules = import.meta.glob('../../assets/3-routes/data/*', {
  eager: true,
  import: 'default',
})

const cityHtmlModules = import.meta.glob('../../assets/5-concrete-route-city/data/*/*.html')

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

function getPeopleNames() {
  return Object.keys(peoplePlateModules)
    .map((path) => {
      const match = path.match(/\/(\d+)\s+(.+)\.[^.]+$/)
      if (!match) {
        return null
      }

      return {
        order: Number(match[1]),
        name: match[2],
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
    .map((item) => item.name)
}

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

function pathKey(city1, city2) {
  return [city1, city2].sort((a, b) => a.localeCompare(b, 'ru')).join('|')
}

function findExistingPathIndex(paths, city1, city2) {
  return paths.findIndex(
    (path) =>
      (path.city1 === city1 && path.city2 === city2)
      || (path.city1 === city2 && path.city2 === city1),
  )
}

function buildPathPolylinePoints(path) {
  const start = coordinatesByCity.get(path.city1)
  const end = coordinatesByCity.get(path.city2)
  if (!start || !end) {
    return null
  }

  const points = [
    { x: start.mapX, y: start.mapY },
    ...(path.coordinates ?? []),
    { x: end.mapX, y: end.mapY },
  ]

  return points.map(({ x, y }) => `${x},${y}`).join(' ')
}

function clientToDesignCoords(event, element) {
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    return null
  }

  return {
    x: Math.round(((event.clientX - rect.left) / rect.width) * DESIGN_WIDTH),
    y: Math.round(((event.clientY - rect.top) / rect.height) * DESIGN_HEIGHT),
  }
}

const RECORDING_IDLE = 'idle'
const RECORDING_START = 'picking-start'
const RECORDING_POINTS = 'recording'

const ConcreteRouteMapAdmin = () => {
  const peopleNames = useMemo(() => getPeopleNames(), [])
  const [peopleName, setPeopleName] = useState(peopleNames[0] ?? '')
  const [paths, setPaths] = useState([])
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [recordingMode, setRecordingMode] = useState(RECORDING_IDLE)
  const [startCity, setStartCity] = useState(null)
  const [draftPoints, setDraftPoints] = useState([])

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

  const loadPaths = useCallback(async () => {
    setLoadError('')
    try {
      const response = await fetch('/api/admin/paths')
      if (!response.ok) {
        throw new Error(`Не удалось загрузить path.json (${response.status})`)
      }
      const data = await response.json()
      setPaths(Array.isArray(data.paths) ? data.paths : [])
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Ошибка загрузки')
    }
  }, [])

  useEffect(() => {
    loadPaths()
  }, [loadPaths])

  const persistPaths = useCallback(async (nextPaths) => {
    setSaveError('')
    try {
      const response = await fetch('/api/admin/paths', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: nextPaths }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || `Ошибка сохранения (${response.status})`)
      }

      setPaths(nextPaths)
      return true
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Ошибка сохранения')
      return false
    }
  }, [])

  const resetRecording = () => {
    setRecordingMode(RECORDING_IDLE)
    setStartCity(null)
    setDraftPoints([])
  }

  const handleStartRecording = () => {
    setSaveError('')
    setRecordingMode(RECORDING_START)
    setStartCity(null)
    setDraftPoints([])
  }

  const handleCancelRecording = () => {
    resetRecording()
  }

  const finishRecording = async (endCity) => {
    if (!startCity || !endCity || startCity === endCity) {
      return
    }

    const existingIndex = findExistingPathIndex(paths, startCity, endCity)
    const isOverwrite = existingIndex >= 0
    const message = isOverwrite
      ? `Вы действительно хотите ПЕРЕЗАПИСАТЬ путь ${startCity}-${endCity}?`
      : `Вы действительно хотите добавить новый путь ${startCity}-${endCity}?`

    if (!window.confirm(message)) {
      return
    }

    const newPath = {
      city1: startCity,
      city2: endCity,
      coordinates: draftPoints.map(({ x, y }) => ({ x, y })),
    }

    const nextPaths = [...paths]
    if (isOverwrite) {
      nextPaths[existingIndex] = newPath
    } else {
      nextPaths.push(newPath)
    }

    const saved = await persistPaths(nextPaths)
    if (saved) {
      resetRecording()
    }
  }

  const handleMarkerClick = (cityName, event) => {
    event.stopPropagation()

    if (recordingMode === RECORDING_IDLE) {
      return
    }

    if (recordingMode === RECORDING_START) {
      setStartCity(cityName)
      setDraftPoints([])
      setRecordingMode(RECORDING_POINTS)
      return
    }

    if (recordingMode === RECORDING_POINTS) {
      if (cityName === startCity) {
        return
      }

      finishRecording(cityName)
    }
  }

  const handleMapClick = (event) => {
    if (recordingMode !== RECORDING_POINTS) {
      return
    }

    const point = clientToDesignCoords(event, event.currentTarget)
    if (!point) {
      return
    }

    setDraftPoints((prev) => [...prev, point])
  }

  const handleDeletePath = async (city1, city2) => {
    const index = findExistingPathIndex(paths, city1, city2)
    if (index < 0) {
      return
    }

    const path = paths[index]
    if (!window.confirm(`Удалить путь ${path.city1}-${path.city2}?`)) {
      return
    }

    const nextPaths = paths.filter((_, i) => i !== index)
    await persistPaths(nextPaths)
  }

  const statusText = (() => {
    if (recordingMode === RECORDING_START) {
      return 'Выберите город начала пути'
    }
    if (recordingMode === RECORDING_POINTS) {
      return `Путь от «${startCity}»: кликайте точки на карте, затем выберите город назначения`
    }
    return 'Выберите народ и управляйте путями'
  })()

  const peopleCityNames = useMemo(
    () => new Set(cityMarkers.map((marker) => marker.cityName)),
    [cityMarkers],
  )

  const visiblePaths = useMemo(
    () =>
      paths.filter(
        (path) => peopleCityNames.has(path.city1) && peopleCityNames.has(path.city2),
      ),
    [paths, peopleCityNames],
  )

  const draftPolylinePoints = useMemo(() => {
    if (!startCity || recordingMode !== RECORDING_POINTS) {
      return ''
    }

    const startCoords = coordinatesByCity.get(startCity)
    if (!startCoords) {
      return ''
    }

    const points = [
      { x: startCoords.mapX, y: startCoords.mapY },
      ...draftPoints,
    ]

    return points.map(({ x, y }) => `${x},${y}`).join(' ')
  }, [startCity, recordingMode, draftPoints])

  const savedPathPolylines = useMemo(
    () =>
      visiblePaths
        .map((path) => ({
          key: pathKey(path.city1, path.city2),
          points: buildPathPolylinePoints(path),
          waypoints: path.coordinates ?? [],
        }))
        .filter((item) => item.points),
    [visiblePaths],
  )

  return (
    <section className="crm-admin">
      <div
        className={`crm-admin__map${recordingMode !== RECORDING_IDLE ? ' crm-admin__map_recording' : ''}`}
        onClick={handleMapClick}
      >
        <AbsoluteImage src={mapImage} width={DESIGN_WIDTH} height={DESIGN_HEIGHT} />
        <AbsoluteImage src={routeImage} width={DESIGN_WIDTH} height={DESIGN_HEIGHT} />

        <svg
          className="crm-admin__paths-svg"
          width={DESIGN_WIDTH}
          height={DESIGN_HEIGHT}
          viewBox={`0 0 ${DESIGN_WIDTH} ${DESIGN_HEIGHT}`}
        >
          {savedPathPolylines.map(({ key, points, waypoints }) => (
            <g key={key}>
              <polyline
                points={points}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {waypoints.map((point, index) => (
                <circle
                  key={`${key}-${point.x}-${point.y}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#38bdf8"
                />
              ))}
            </g>
          ))}
          {draftPolylinePoints ? (
            <>
              <polyline
                points={draftPolylinePoints}
                fill="none"
                stroke="#e11d48"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {draftPoints.map((point, index) => (
                <circle
                  key={`draft-${point.x}-${point.y}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="#e11d48"
                />
              ))}
            </>
          ) : null}
        </svg>

        {cityMarkers.map(({ cityName, mapX, mapY, labelX, labelY, labelColor }) => (
          <Absolute
            key={`label-${cityName}`}
            fromCenter
            top={labelY}
            left={labelX}
            className="crm-admin__city-label"
            style={{ color: labelColor }}
          >
            <span style={{ color: labelColor }}>{cityName}</span>
          </Absolute>
        ))}

        {cityMarkers.map(({ cityName, mapX, mapY }) => {
          const isStart = startCity === cityName
          return (
            <Absolute
              key={cityName}
              fromCenter
              top={mapY}
              left={mapX}
              className={`crm-admin__marker-wrap${isStart ? ' crm-admin__marker-wrap_start' : ''}`}
              onClick={(event) => handleMarkerClick(cityName, event)}
            >
              <button
                type="button"
                className="crm-admin__marker"
                aria-label={cityName}
              >
                <DivImage
                  src={markerInactiveImage}
                  className="crm-admin__marker-image crm-admin__marker-image_inactive"
                />
                <DivImage
                  src={markerActiveImage}
                  className="crm-admin__marker-image crm-admin__marker-image_active"
                />
              </button>
            </Absolute>
          )
        })}
      </div>

      <aside className="crm-admin__panel">
        <h1 className="crm-admin__title">Админ: карта маршрутов</h1>

        <label className="crm-admin__field">
          <span>Народ</span>
          <select
            value={peopleName}
            onChange={(event) => {
              setPeopleName(event.target.value)
              resetRecording()
            }}
          >
            {peopleNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <p className="crm-admin__status">{statusText}</p>

        {loadError ? <p className="crm-admin__error">{loadError}</p> : null}
        {saveError ? <p className="crm-admin__error">{saveError}</p> : null}

        <div className="crm-admin__actions">
          {recordingMode === RECORDING_IDLE ? (
            <button type="button" className="crm-admin__btn crm-admin__btn_primary" onClick={handleStartRecording}>
              Добавить траекторию
            </button>
          ) : (
            <button type="button" className="crm-admin__btn" onClick={handleCancelRecording}>
              Отменить запись
            </button>
          )}
        </div>

        <div className="crm-admin__paths">
          <h2>Существующие пути</h2>
          {visiblePaths.length === 0 ? (
            <p className="crm-admin__empty">Путей пока нет</p>
          ) : (
            <ul>
              {visiblePaths.map((path) => (
                <li key={pathKey(path.city1, path.city2)}>
                  <span>
                    {path.city1} — {path.city2}
                    <small>
                      {' '}
                      ({path.coordinates?.length ?? 0} тчк.)
                    </small>
                  </span>
                  <button
                    type="button"
                    className="crm-admin__btn crm-admin__btn_danger"
                    onClick={() => handleDeletePath(path.city1, path.city2)}
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </section>
  )
}

export default ConcreteRouteMapAdmin
