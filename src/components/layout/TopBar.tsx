import { useLocation } from 'react-router-dom'

const TITLES: Record<string, { title: string; desc: string }> = {
  '/dashboard': { title: '대시보드', desc: '오늘의 식사·영양 관리 현황을 한눈에 확인하세요' },
  '/meal-plan': { title: '식단 관리', desc: '주간 식단표를 계획하고 관리합니다' },
  '/residents': { title: '입소자 관리', desc: '입소자별 건강 상태와 식이 요구사항을 관리합니다' },
  '/nutrition': { title: '영양 분석', desc: '개인별 영양 섭취량과 목표 달성률을 분석합니다' },
  '/inventory': { title: '식자재 재고', desc: '식자재 재고와 발주 현황을 관리합니다' },
  '/reports': { title: '리포트', desc: '월간·주간 보고서를 확인하고 내보냅니다' },
  '/settings': { title: '설정', desc: '시스템 및 계정 설정을 관리합니다' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const info = TITLES[pathname] ?? TITLES['/dashboard']

  return (
    <header className="topbar">
      <div className="topbar__left">
        <div>
          <h1 className="topbar__title">{info.title}</h1>
          <p className="topbar__desc">{info.desc}</p>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__search">
          <i className="ti ti-search" />
          <input placeholder="입소자, 식단, 식자재 검색..." />
          <kbd>⌘K</kbd>
        </div>

        <button className="topbar__icon-btn" aria-label="도움말">
          <i className="ti ti-help" />
        </button>

        <button className="topbar__icon-btn topbar__icon-btn--notify" aria-label="알림">
          <i className="ti ti-bell" />
          <span className="topbar__notify-dot" />
        </button>

        <div className="topbar__divider" />

        <div className="topbar__date">
          <i className="ti ti-calendar" />
          <span>2025년 3월 15일 (토)</span>
        </div>
      </div>
    </header>
  )
}
