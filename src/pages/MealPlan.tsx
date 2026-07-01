import { useState } from 'react'
import '../components/dashboard/dashboard.css'
import './meal-plan.css'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const DATES = ['3/10', '3/11', '3/12', '3/13', '3/14', '3/15', '3/16']

const PLAN: Record<string, Record<string, { name: string; cal: number; tag: string }[]>> = {
  아침: {
    월: [{ name: '흰죽', cal: 180, tag: '연화식' }, { name: '단호박스프', cal: 120, tag: '일반식' }],
    화: [{ name: '오트밀', cal: 220, tag: '고섬유' }, { name: '삶은계란', cal: 78, tag: '일반식' }],
    수: [{ name: '두유', cal: 130, tag: '고단백' }, { name: '토스트', cal: 200, tag: '일반식' }],
    목: [{ name: '누룽지', cal: 160, tag: '연화식' }, { name: '요거트', cal: 90, tag: '일반식' }],
    금: [{ name: '흰죽', cal: 180, tag: '연화식' }, { name: '계란찜', cal: 130, tag: '일반식' }],
    토: [{ name: '전복죽', cal: 240, tag: '보양식' }, { name: '김치', cal: 20, tag: '저염식' }],
    일: [{ name: '팥죽', cal: 260, tag: '일반식' }, { name: '나박김치', cal: 15, tag: '저염식' }],
  },
  점심: {
    월: [{ name: '잡곡밥', cal: 310, tag: '일반식' }, { name: '갈치조림', cal: 220, tag: '일반식' }],
    화: [{ name: '흰밥', cal: 280, tag: '일반식' }, { name: '불고기', cal: 340, tag: '고단백' }],
    수: [{ name: '보리밥', cal: 290, tag: '고섬유' }, { name: '고등어구이', cal: 260, tag: '오메가3' }],
    목: [{ name: '현미밥', cal: 300, tag: '고섬유' }, { name: '닭갈비', cal: 380, tag: '고단백' }],
    금: [{ name: '잡곡밥', cal: 310, tag: '일반식' }, { name: '두부조림', cal: 180, tag: '저염식' }],
    토: [{ name: '비빔밥', cal: 480, tag: '일반식' }, { name: '미역국', cal: 45, tag: '저염식' }],
    일: [{ name: '해물칼국수', cal: 420, tag: '일반식' }, { name: '단무지', cal: 15, tag: '일반식' }],
  },
  저녁: {
    월: [{ name: '흰밥', cal: 280, tag: '일반식' }, { name: '닭가슴살조림', cal: 180, tag: '고단백' }],
    화: [{ name: '잡곡밥', cal: 310, tag: '일반식' }, { name: '연어스테이크', cal: 320, tag: '오메가3' }],
    수: [{ name: '흰밥', cal: 280, tag: '일반식' }, { name: '동태찌개', cal: 190, tag: '저염식' }],
    목: [{ name: '보리밥', cal: 290, tag: '고섬유' }, { name: '제육볶음', cal: 380, tag: '일반식' }],
    금: [{ name: '흰밥', cal: 280, tag: '일반식' }, { name: '갈비탕', cal: 380, tag: '보양식' }],
    토: [{ name: '현미밥', cal: 300, tag: '고섬유' }, { name: '고등어무조림', cal: 240, tag: '오메가3' }],
    일: [{ name: '흰죽', cal: 180, tag: '연화식' }, { name: '북어국', cal: 90, tag: '저염식' }],
  },
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  '일반식': { bg: '#f0f9f4', color: '#2d724b' },
  '연화식': { bg: '#fef3e0', color: '#a56b0d' },
  '저염식': { bg: '#e6f1f9', color: '#2a6a9c' },
  '고단백': { bg: '#ffe4dc', color: '#c34527' },
  '고섬유': { bg: '#dcf0e2', color: '#245c3d' },
  '오메가3': { bg: '#e6f1f9', color: '#2a6a9c' },
  '보양식': { bg: '#ffe4dc', color: '#c34527' },
}

export default function MealPlan() {
  const [week, setWeek] = useState(0)

  return (
    <>
      <div className="mp-toolbar fade-in">
        <div className="mp-toolbar__left">
          <button className="btn btn--secondary btn--sm" onClick={() => setWeek(w => w - 1)}>
            <i className="ti ti-chevron-left" />
          </button>
          <div className="mp-toolbar__date">
            <i className="ti ti-calendar-week" />
            <span>2025년 3월 10일 - 3월 16일</span>
          </div>
          <button className="btn btn--secondary btn--sm" onClick={() => setWeek(w => w + 1)}>
            <i className="ti ti-chevron-right" />
          </button>
          <button className="btn btn--ghost btn--sm">오늘</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--secondary btn--sm">
            <i className="ti ti-printer" /> 인쇄
          </button>
          <button className="btn btn--secondary btn--sm">
            <i className="ti ti-download" /> 내보내기
          </button>
          <button className="btn btn--primary btn--sm">
            <i className="ti ti-plus" /> 식단 추가
          </button>
        </div>
      </div>

      <div className="card mp-grid-wrap fade-in fade-in--1">
        <div className="mp-grid">
          <div className="mp-cell mp-cell--head mp-cell--corner">구분</div>
          {DAYS.map((d, i) => (
            <div key={d} className={`mp-cell mp-cell--head ${i >= 5 ? 'mp-cell--weekend' : ''}`}>
              <div className="mp-day">{d}</div>
              <div className="mp-date">{DATES[i]}</div>
            </div>
          ))}

          {(['아침', '점심', '저녁'] as const).map(meal => (
            <div key={meal} style={{ display: 'contents' }}>
              <div className="mp-cell mp-cell--label">
                <div className="mp-meal-icon">
                  <i className={
                    meal === '아침' ? 'ti ti-sunrise' :
                    meal === '점심' ? 'ti ti-sun' : 'ti ti-moon'
                  } />
                </div>
                <div>{meal}</div>
              </div>
              {DAYS.map((day, di) => {
                const items = PLAN[meal][day] || []
                const total = items.reduce((s, i) => s + i.cal, 0)
                return (
                  <div key={day} className={`mp-cell ${di >= 5 ? 'mp-cell--weekend' : ''}`}>
                    <div className="mp-menu-list">
                      {items.map((it, i) => {
                        const tc = TAG_COLORS[it.tag] || { bg: '#f4f4f1', color: '#565650' }
                        return (
                          <div key={i} className="mp-menu">
                            <div className="mp-menu__name">{it.name}</div>
                            <div className="mp-menu__meta">
                              <span className="mp-menu__tag" style={{ background: tc.bg, color: tc.color }}>{it.tag}</span>
                              <span className="mp-menu__cal">{it.cal}kcal</span>
                            </div>
                          </div>
                        )
                      })}
                      <div className="mp-menu__total">총 {total} kcal</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mp-summary fade-in fade-in--2">
        <div className="card mp-summary-card">
          <i className="ti ti-flame mp-summary-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }} />
          <div>
            <div className="mp-summary-label">주간 평균 칼로리</div>
            <div className="mp-summary-value">1,847 <span>kcal</span></div>
          </div>
        </div>
        <div className="card mp-summary-card">
          <i className="ti ti-meat mp-summary-icon" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }} />
          <div>
            <div className="mp-summary-label">단백질 평균</div>
            <div className="mp-summary-value">82 <span>g</span></div>
          </div>
        </div>
        <div className="card mp-summary-card">
          <i className="ti ti-salt mp-summary-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }} />
          <div>
            <div className="mp-summary-label">평균 나트륨</div>
            <div className="mp-summary-value">1,720 <span>mg</span></div>
          </div>
        </div>
        <div className="card mp-summary-card">
          <i className="ti ti-plant mp-summary-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }} />
          <div>
            <div className="mp-summary-label">식이섬유</div>
            <div className="mp-summary-value">24 <span>g</span></div>
          </div>
        </div>
      </div>
    </>
  )
}
