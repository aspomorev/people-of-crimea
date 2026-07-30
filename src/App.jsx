import { matchPath, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Main from './pages/Main'
import RoutesPage from './pages/Routes'
import TimeLine from './pages/TimeLine'
import ModernEthnicity from './pages/ModernEthnicity'
import ConcreteHistory from './pages/ConcreteHistory'
import ConcreteHistoryChapter from './pages/ConcreteHistoryChapter'
import Background, { BACKGROUND_TYPE } from './components/Background'
import BackgroundLogos from './components/BackgroundLogos'
import AppBackButton from './components/AppBackButton'
import ConcreteRouteMap from './pages/ConcreteRouteMap'
import ConcreteRouteCity from './pages/ConcreteRouteCity'
import Landmark from './pages/Landmark'
import AdminMenu from './pages/admin/AdminMenu'
import ConcreteRouteMapAdmin from './pages/admin/ConcreteRouteMapAdmin'
import RouteReadyGate from './components/RouteReadyGate'
import { useDeferredRouteLocation } from './hooks/useRouteReady'

function App() {
  const { displayLocation, isInitialLoading } = useDeferredRouteLocation()
  const activePathname = displayLocation?.pathname ?? '/'
  const isAdminRoute =
    activePathname === '/admin'
    || activePathname.startsWith('/admin/')

  const backgroundRoutes = [
    { path: '/timeline', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true, showBackButton: true },
    { path: '/modern-ethnicity', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true, showBackButton: true },
    { path: '/routes', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true, showBackButton: true },
    { path: '/routes/map/:people/:city/:landmark', backgroundType: BACKGROUND_TYPE.PARCHMENT, showClouds: false, showLogos: true, showBackButton: true },
    { path: '/routes/map/:people/:city', backgroundType: BACKGROUND_TYPE.PARCHMENT, showClouds: false, showLogos: true, showBackButton: true },
    { path: '/routes/map/:people', backgroundType: BACKGROUND_TYPE.ROUTE_MAP, showClouds: true, showLogos: true, isCloudsBehind: true, showBackButton: true },
    { path: '/routes/history/:people', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true, showBackButton: true },
    { path: '/routes/history/:people/:title', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true, showBackButton: true },
    { path: '/', backgroundType: BACKGROUND_TYPE.MAP, showClouds: true, showLogos: true },
  ]

  const backgroundConfig = isAdminRoute
    ? null
    : backgroundRoutes.find(({ path }) => matchPath({ path, end: true }, activePathname))

  return (
    <div className="app-shell">
      <RouteReadyGate ready={!isInitialLoading}>
        {backgroundConfig ? (
          <Background
            backgroundType={backgroundConfig.backgroundType}
            showClouds={backgroundConfig.showClouds}
            isCloudsBehind={backgroundConfig.isCloudsBehind}
          />
        ) : null}
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
                <Route path="/routes/map/:people/:city/:landmark" element={<Landmark />} />
                <Route path="/admin" element={<AdminMenu />} />
                <Route path="/admin/concrete-route-map" element={<ConcreteRouteMapAdmin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : null}
          </main>
        </div>
        {backgroundConfig?.showLogos ? <BackgroundLogos /> : null}
        {backgroundConfig?.showBackButton ? <AppBackButton /> : null}
      </RouteReadyGate>
    </div>
  )
}

export default App
