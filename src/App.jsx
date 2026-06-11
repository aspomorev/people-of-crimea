import { matchPath, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Main from './pages/Main'
import RoutesPage from './pages/Routes'
import TimeLine from './pages/TimeLine'
import ModernEthnicity from './pages/ModernEthnicity'
import ConcreteHistory from './pages/ConcreteHistory'
import ConcreteHistoryChapter from './pages/ConcreteHistoryChapter'
import Background, { BACKGROUND_TYPE } from './components/Background'
import ConcreteRouteMap from './pages/ConcreteRouteMap'
import ConcreteRouteCity from './pages/ConcreteRouteCity'
import RouteReadyGate from './components/RouteReadyGate'
import { useDeferredRouteLocation } from './hooks/useRouteReady'

function App() {
  const { displayLocation, isInitialLoading } = useDeferredRouteLocation()
  const activePathname = displayLocation?.pathname ?? '/'

  const backgroundRoutes = [
    { path: '/timeline', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/modern-ethnicity', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/routes', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/routes/map/:people/:city', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/routes/map/:people', backgroundType: BACKGROUND_TYPE.PARCHMENT, showClouds: true, showLogos: true, isCloudsBehind: true },
    { path: '/routes/history/:people', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/routes/history/:people/:title', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/', backgroundType: BACKGROUND_TYPE.MAP, showClouds: true, showLogos: true },
  ]

  const backgroundConfig = backgroundRoutes.find(({ path }) =>
    matchPath({ path, end: true }, activePathname),
  )

  return (
    <div className="app-shell">
      <RouteReadyGate ready={!isInitialLoading}>
        <Background
          backgroundType={backgroundConfig?.backgroundType}
          showClouds={backgroundConfig?.showClouds}
          showLogos={backgroundConfig?.showLogos}
          isCloudsBehind={backgroundConfig?.isCloudsBehind}
        />
        <div className="app">
          <main className="app-content">
            {displayLocation ? (
              <Routes location={displayLocation}>
                <Route path="/" element={<Main />} />
                <Route path="/timeline" element={<TimeLine />} />
                <Route path="/modern-ethnicity" element={<ModernEthnicity />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/routes/history/:people" element={<ConcreteHistory />} />
                <Route path="/routes/history/:people/:title" element={<ConcreteHistoryChapter />} />
                <Route path="/routes/map/:people" element={<ConcreteRouteMap />} />
                <Route path="/routes/map/:people/:city" element={<ConcreteRouteCity />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : null}
          </main>
        </div>
      </RouteReadyGate>
    </div>
  )
}

export default App
