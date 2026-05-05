import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import AboutPage from './pages/AboutPage'
import Main from './pages/Main'
import AppBackground from './components/AppBackground'

function App() {
  return (
    <div className="app-shell">
      <AppBackground />
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      </div>
    </div>
  )
}

export default App
