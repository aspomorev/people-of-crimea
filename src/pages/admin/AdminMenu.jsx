import { Link } from 'react-router-dom'
import './AdminMenu.css'

const ADMIN_MENU_ITEMS = [
  { id: 'concrete-route-map', label: 'Маршруты на карте', to: '/admin/concrete-route-map' },
  { id: 'placeholder-2', label: 'Раздел 2' },
  { id: 'placeholder-3', label: 'Раздел 3' },
  { id: 'placeholder-4', label: 'Раздел 4' },
  { id: 'placeholder-5', label: 'Раздел 5' },
  { id: 'placeholder-6', label: 'Раздел 6' },
  { id: 'placeholder-7', label: 'Раздел 7' },
  { id: 'placeholder-8', label: 'Раздел 8' },
  { id: 'placeholder-9', label: 'Раздел 9' },
  { id: 'placeholder-10', label: 'Раздел 10' },
]

const AdminMenu = () => {
  return (
    <section className="admin-menu">
      <div className="admin-menu__panel">
        <h1 className="admin-menu__title">Админ-панель</h1>
        <p className="admin-menu__subtitle">Выберите раздел для редактирования</p>
        <nav className="admin-menu__grid" aria-label="Разделы админ-панели">
          {ADMIN_MENU_ITEMS.map((item) => {
            if (item.to) {
              return (
                <Link key={item.id} to={item.to} className="admin-menu__btn">
                  {item.label}
                </Link>
              )
            }

            return (
              <button key={item.id} type="button" className="admin-menu__btn admin-menu__btn_disabled" disabled>
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </section>
  )
}

export default AdminMenu
