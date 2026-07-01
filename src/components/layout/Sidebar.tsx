import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/dashboard', icon: 'ti-layout-dashboard', label: '대시보드' },
  { to: '/meal-plan', icon: 'ti-tools-kitchen-2', label: '식단 관리' },
  { to: '/residents', icon: 'ti-users', label: '입소자 관리' },
  { to: '/nutrition', icon: 'ti-heart-rate-monitor', label: '영양 분석' },
  { to: '/inventory', icon: 'ti-package', label: '식자재 재고' },
  { to: '/reports', icon: 'ti-file-analytics', label: '리포트' },
]

const NAV_BOTTOM = [
  { to: '/settings', icon: 'ti-settings', label: '설정' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <i className="ti ti-leaf" />
        </div>
        <div className="sidebar__brand-text">
          <div className="sidebar__brand-name">NutriCare</div>
          <div className="sidebar__brand-sub">요양원 관리 시스템</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__section-label">메인 메뉴</div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              'sidebar__item' + (isActive ? ' sidebar__item--active' : '')
            }
          >
            <i className={`ti ${item.icon}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        {NAV_BOTTOM.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              'sidebar__item' + (isActive ? ' sidebar__item--active' : '')
            }
          >
            <i className={`ti ${item.icon}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar__user">
          <div className="sidebar__avatar">김</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">김영양 팀장</div>
            <div className="sidebar__user-role">영양사 · 관리자</div>
          </div>
          <button className="sidebar__user-more" aria-label="더보기">
            <i className="ti ti-dots-vertical" />
          </button>
        </div>
      </div>
    </aside>
  )
}
