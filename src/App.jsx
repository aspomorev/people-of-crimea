import { matchPath, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Main from './pages/Main'
import RoutesPage from './pages/Routes'
import TimeLine from './pages/TimeLine'
import ConcreteHistory from './pages/ConcreteHistory'
import Background, { BACKGROUND_TYPE } from './components/Background'
import ConcreteRouteMap from './pages/ConcreteRouteMap'
import ConcreteRouteCity from './pages/ConcreteRouteCity'

function App() {
  const { pathname } = useLocation()

  const backgroundRoutes = [
    { path: '/timeline', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/routes', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/concrete-route-map/:people/:city', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/concrete-route-map/:people', backgroundType: BACKGROUND_TYPE.PARCHMENT, showClouds: true, showLogos: true, isCloudsBehind: true },
    { path: '/concrete-history/:people', backgroundType: BACKGROUND_TYPE.BLURED_MAP, showClouds: true, showLogos: true },
    { path: '/', backgroundType: BACKGROUND_TYPE.MAP, showClouds: true, showLogos: true },
  ]

  const backgroundConfig = backgroundRoutes.find(({ path }) =>
    matchPath({ path, end: true }, pathname),
  )

  return (
    <div className="app-shell">
      <Background
        backgroundType={backgroundConfig?.backgroundType}
        showClouds={backgroundConfig?.showClouds}
        showLogos={backgroundConfig?.showLogos}
        isCloudsBehind={backgroundConfig?.isCloudsBehind}
      />
      <div className="app">
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/timeline" element={<TimeLine />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/concrete-history/:people" element={<ConcreteHistory />} />
            <Route path="/concrete-route-map/:people" element={<ConcreteRouteMap />} />
            <Route path="/concrete-route-map/:people/:city" element={<ConcreteRouteCity />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
