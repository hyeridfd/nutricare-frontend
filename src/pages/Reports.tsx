import './reports.css'

const REPORTS = [
  { icon: 'ti-file-analytics', color: 'brand', title: '월간 영양 리포트', desc: '2025년 3월 · 45명 종합 분석', date: '2025.03.15', size: '2.4 MB', type: 'PDF' },
  { icon: 'ti-report', color: 'info', title: '주간 식단 실행 보고서', desc: '3월 10일 - 3월 16일', date: '2025.03.14', size: '1.8 MB', type: 'PDF' },
  { icon: 'ti-chart-histogram', color: 'success', title: '입소자별 건강 지표', desc: '분기별 종합 리포트', date: '2025.03.10', size: '3.2 MB', type: 'Excel' },
  { icon: 'ti-receipt', color: 'warning', title: '식자재 구매 내역', desc: '2월 구매 명세서', date: '2025.03.01', size: '1.1 MB', type: 'Excel' },
  { icon: 'ti-heart-rate-monitor', color: 'accent', title: '특별 관리 대상자 리포트', desc: '만성질환 · 알레르기 관리', date: '2025.03.08', size: '2.0 MB', type: 'PDF' },
  { icon: 'ti-clipboard-check', color: 'brand', title: '위생 점검 결과', desc: '주방 · 식품 안전 점검', date: '2025.03.12', size: '1.5 MB', type: 'PDF' },
]

const RECENT_ACTIVITY = [
  { user: '김영양', action: '월간 영양 리포트를 생성했습니다', time: '30분 전' },
  { user: '박관리', action: '3월 식단표를 승인했습니다', time: '2시간 전' },
  { user: '이간호', action: '정말자님 건강 기록을 업데이트했습니다', time: '4시간 전' },
  { user: '김영양', action: '주간 식자재 발주서를 작성했습니다', time: '어제' },
  { user: '박관리', action: '입소자 이금자님을 등록했습니다', time: '2일 전' },
]

export default function Reports() {
  return (
    <>
      <div className="rp-quick fade-in">
        {[
          { icon: 'ti-file-plus', label: '리포트 생성', desc: '새 리포트 만들기' },
          { icon: 'ti-calendar-stats', label: '월간 요약', desc: '3월 종합 분석' },
          { icon: 'ti-chart-line', label: '트렌드 분석', desc: '3개월 추이 확인' },
          { icon: 'ti-share', label: '리포트 공유', desc: '팀원과 공유하기' },
        ].map((q, i) => (
          <button key={i} className="card card--hover rp-quick-card">
            <div className="rp-quick-icon">
              <i className={`ti ${q.icon}`} />
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div className="rp-quick-label">{q.label}</div>
              <div className="rp-quick-desc">{q.desc}</div>
            </div>
            <i className="ti ti-arrow-right" style={{ color: 'var(--text-tertiary)' }} />
          </button>
        ))}
      </div>

      <div className="rp-layout">
        <div className="card fade-in fade-in--1">
          <div className="card__header">
            <div>
              <div className="card__title">최근 리포트</div>
              <div className="card__subtitle">최신 순 6개</div>
            </div>
            <button className="btn btn--secondary btn--sm">전체 보기</button>
          </div>
          <div className="rp-list">
            {REPORTS.map((r, i) => (
              <div key={i} className="rp-item">
                <div className={`rp-item__icon rp-item__icon--${r.color}`}>
                  <i className={`ti ${r.icon}`} />
                </div>
                <div className="rp-item__body">
                  <div className="rp-item__title">{r.title}</div>
                  <div className="rp-item__desc">{r.desc}</div>
                  <div className="rp-item__meta">
                    <span><i className="ti ti-calendar" /> {r.date}</span>
                    <span><i className="ti ti-file" /> {r.type} · {r.size}</span>
                  </div>
                </div>
                <div className="rp-item__actions">
                  <button className="btn btn--ghost btn--icon" title="미리보기">
                    <i className="ti ti-eye" />
                  </button>
                  <button className="btn btn--ghost btn--icon" title="다운로드">
                    <i className="ti ti-download" />
                  </button>
                  <button className="btn btn--ghost btn--icon" title="공유">
                    <i className="ti ti-share" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card fade-in fade-in--2">
          <div className="card__header">
            <div>
              <div className="card__title">최근 활동</div>
              <div className="card__subtitle">팀 내 활동 기록</div>
            </div>
          </div>
          <div className="rp-activity">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="rp-activity-item">
                <div className="rp-activity-avatar">{a.user[0]}</div>
                <div className="rp-activity-line" />
                <div className="rp-activity-body">
                  <div className="rp-activity-text">
                    <strong>{a.user}</strong>님이 {a.action}
                  </div>
                  <div className="rp-activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
