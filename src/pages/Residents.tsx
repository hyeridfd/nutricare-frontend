import { useState } from 'react'
import './residents.css'

const RESIDENTS = [
  { id: 1, name: '박순자', age: 82, gender: '여', room: '201호', diet: '당뇨식', allergy: '없음', status: 'ok', bmi: 22.4, note: '혈당 안정' },
  { id: 2, name: '김영수', age: 78, gender: '남', room: '203호', diet: '저염식', allergy: '땅콩', status: 'attention', bmi: 24.1, note: '혈압 관찰 중' },
  { id: 3, name: '이금자', age: 85, gender: '여', room: '205호', diet: '연화식', allergy: '없음', status: 'ok', bmi: 20.8, note: '치아 문제' },
  { id: 4, name: '최영희', age: 79, gender: '여', room: '208호', diet: '일반식', allergy: '없음', status: 'ok', bmi: 23.2, note: '건강 양호' },
  { id: 5, name: '정말자', age: 88, gender: '여', room: '210호', diet: '유동식', allergy: '유제품', status: 'alert', bmi: 19.1, note: '체중 감소 주의' },
  { id: 6, name: '홍길동', age: 76, gender: '남', room: '212호', diet: '일반식', allergy: '갑각류', status: 'ok', bmi: 25.6, note: '' },
  { id: 7, name: '강복순', age: 84, gender: '여', room: '215호', diet: '당뇨식', allergy: '없음', status: 'attention', bmi: 21.5, note: '혈당 조절 중' },
  { id: 8, name: '오영자', age: 81, gender: '여', room: '217호', diet: '저염식', allergy: '없음', status: 'ok', bmi: 22.9, note: '' },
]

const AVATAR_COLORS = [
  'linear-gradient(135deg,#8fc9a5,#3d8f60)',
  'linear-gradient(135deg,#ffab90,#ea5a3c)',
  'linear-gradient(135deg,#f5b754,#e89b1e)',
  'linear-gradient(135deg,#6ba3d0,#3b82c4)',
  'linear-gradient(135deg,#bce0c9,#5eab7d)',
]

export default function Residents() {
  const [filter, setFilter] = useState('all')

  const filtered = RESIDENTS.filter(r => {
    if (filter === 'all') return true
    if (filter === 'alert') return r.status === 'alert' || r.status === 'attention'
    return r.diet === filter
  })

  return (
    <>
      <div className="res-toolbar fade-in">
        <div className="res-filter">
          {[
            { k: 'all', label: '전체', count: RESIDENTS.length },
            { k: 'alert', label: '관찰/주의', count: RESIDENTS.filter(r => r.status !== 'ok').length },
            { k: '일반식', label: '일반식', count: RESIDENTS.filter(r => r.diet === '일반식').length },
            { k: '당뇨식', label: '당뇨식', count: RESIDENTS.filter(r => r.diet === '당뇨식').length },
            { k: '저염식', label: '저염식', count: RESIDENTS.filter(r => r.diet === '저염식').length },
            { k: '연화식', label: '연화식', count: RESIDENTS.filter(r => r.diet === '연화식').length },
          ].map(f => (
            <button
              key={f.k}
              className={`res-filter__chip ${filter === f.k ? 'res-filter__chip--active' : ''}`}
              onClick={() => setFilter(f.k)}
            >
              {f.label} <span>{f.count}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--secondary btn--sm">
            <i className="ti ti-filter" /> 상세 필터
          </button>
          <button className="btn btn--primary btn--sm">
            <i className="ti ti-user-plus" /> 입소자 등록
          </button>
        </div>
      </div>

      <div className="res-grid fade-in fade-in--1">
        {filtered.map((r, i) => (
          <div key={r.id} className="card card--hover res-card">
            <div className="res-card__head">
              <div className="res-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                {r.name[0]}
              </div>
              <div className="res-card__info">
                <div className="res-card__name">
                  {r.name}
                  <span className={
                    r.status === 'ok' ? 'badge badge--success'
                    : r.status === 'attention' ? 'badge badge--warning'
                    : 'badge badge--danger'
                  }>
                    {r.status === 'ok' ? '정상' : r.status === 'attention' ? '관찰' : '주의'}
                  </span>
                </div>
                <div className="res-card__meta">
                  {r.age}세 · {r.gender} · {r.room}
                </div>
              </div>
              <button className="res-card__more">
                <i className="ti ti-dots-vertical" />
              </button>
            </div>
            <div className="res-card__body">
              <div className="res-info-row">
                <div className="res-info-item">
                  <div className="res-info-label">식이 유형</div>
                  <div className="res-info-value">
                    <span className="badge badge--brand">{r.diet}</span>
                  </div>
                </div>
                <div className="res-info-item">
                  <div className="res-info-label">알레르기</div>
                  <div className="res-info-value">
                    {r.allergy === '없음'
                      ? <span className="text-tertiary" style={{ fontSize: 13 }}>없음</span>
                      : <span className="badge badge--danger">{r.allergy}</span>}
                  </div>
                </div>
                <div className="res-info-item">
                  <div className="res-info-label">BMI</div>
                  <div className="res-info-value" style={{ fontWeight: 600 }}>{r.bmi}</div>
                </div>
              </div>
              {r.note && (
                <div className="res-note">
                  <i className="ti ti-message-circle" />
                  <span>{r.note}</span>
                </div>
              )}
              <div className="res-card__actions">
                <button className="btn btn--secondary btn--sm" style={{ flex: 1 }}>
                  <i className="ti ti-file-text" /> 차트
                </button>
                <button className="btn btn--secondary btn--sm" style={{ flex: 1 }}>
                  <i className="ti ti-heart-rate-monitor" /> 영양
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
