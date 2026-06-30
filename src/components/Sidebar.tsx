import { NavLink } from "react-router-dom"

const NAV_ITEMS = [
  { section: "현황 모니터링", items: [
    { path: "/", label: "어르신 현황", icon: "ti-users" },
    { path: "/meal-waste", label: "식사·잔반 현황", icon: "ti-bowl-chopsticks" },
    { path: "/nutrition", label: "영양소 섭취 현황", icon: "ti-chart-donut" },
  ]},
  { section: "식단 관리", items: [
    { path: "/design", label: "MENTOR 식단 설계", icon: "ti-sparkles" },
    { path: "/orders", label: "발주 엑셀 생성", icon: "ti-file-spreadsheet" },
  ]},
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge"><i className="ti ti-heart-rate-monitor" /></div>
        <div className="logo-name">NutriCare</div>
        <div className="logo-sub">요양원 식사·영양 관리 시스템</div>
      </div>

      {NAV_ITEMS.map((group) => (
        <div key={group.section}>
          <div className="nav-section">{group.section}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              end={item.path === "/"}
            >
              <i className={`ti ${item.icon}`} /> {item.label}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <span className="status-dot green" /> 시스템 정상 운영 중
        <br />
        <span style={{ fontSize: 10, marginTop: 3, display: "block", color: "var(--text3)" }}>
          마지막 동기화: 방금 전
        </span>
      </div>
    </aside>
  )
}
