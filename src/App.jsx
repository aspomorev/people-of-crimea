import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import AboutPage from './pages/AboutPage'
import Main from './pages/Main'
import RoutesPage from './pages/Routes'
import TimeLine from './pages/TimeLine'
import ConcreteHistory from './pages/ConcreteHistory'
import Background, { BACKGROUND_TYPE } from './components/Background'
import ConcreteRouteMap from './pages/ConcreteRouteMap'

function App() {
  const { pathname } = useLocation()
  const isRoutesLikePage = pathname === '/routes' || pathname.startsWith('/concrete-history/')
  const backgroundType = isRoutesLikePage ? BACKGROUND_TYPE.BLURED : BACKGROUND_TYPE.DEFAULT
  const showClouds = !isRoutesLikePage

  return (
    <div className="app-shell">
      <Background backgroundType={backgroundType} showClouds={showClouds} />
      <div className="app">
      {/* <header className="app-header">
        <nav className="app-nav">
          <NavLink to="/" end>
            Главная
          </NavLink>
          <NavLink to="/about">О проекте</NavLink>
        </nav>
      </header> */}

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/timeline" element={<TimeLine />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/concrete-history/:people" element={<ConcreteHistory />} />
          <Route path="/concrete-route-map/:people" element={<ConcreteRouteMap />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      </div>
    </div>
  )
}

export default App
