import StatCard from '../components/dashboard/StatCard'
import '../components/dashboard/dashboard.css'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend, ArcElement,
} from 'chart.js'
import { useState } from 'react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement)

const AVATAR_COLORS = [
  'linear-gradient(135deg,#8fc9a5,#3d8f60)',
  'linear-gradient(135deg,#ffab90,#ea5a3c)',
  'linear-gradient(135deg,#f5b754,#e89b1e)',
  'linear-gradient(135deg,#6ba3d0,#3b82c4)',
  'linear-gradient(135deg,#bce0c9,#5eab7d)',
]

const MEALS = {
  breakfast: [
    { name: '흰죽', desc: '부드러운 죽', cal: 180, tag: '연화식' },
    { name: '단호박 스프', desc: '비타민A 풍부', cal: 120, tag: '일반식' },
    { name: '삶은 계란', desc: '단백질 6g', cal: 78, tag: '일반식' },
    { name: '요거트', desc: '유산균 함유', cal: 90, tag: '일반식' },
  ],
  lunch: [
    { name: '잡곡밥', desc: '현미·귀리·보리', cal: 310, tag: '일반식' },
    { name: '된장국', desc: '두부·애호박', cal: 85, tag: '저염식' },
    { name: '갈치조림', desc: '오메가-3 풍부', cal: 220, tag: '일반식' },
    { name: '나물무침', desc: '시금치·도라지', cal: 60, tag: '일반식' },
  ],
  dinner: [
    { name: '흰쌀밥', desc: '소화 잘 되는', cal: 280, tag: '일반식' },
    { name: '미역국', desc: '요오드·칼슘', cal: 45, tag: '저염식' },
    { name: '닭가슴살 조림', desc: '고단백', cal: 180, tag: '고단백' },
    { name: '숙주나물', desc: '식이섬유', cal: 40, tag: '일반식' },
  ],
}

const RESIDENTS = [
  { name: '박순자', age: 82, diet: '당뇨식', room: '201호', status: 'ok' },
  { name: '김영수', age: 78, diet: '저염식', room: '203호', status: 'attention' },
  { name: '이금자', age: 85, diet: '연화식', room: '205호', status: 'ok' },
  { name: '최영희', age: 79, diet: '일반식', room: '208호', status: 'ok' },
  { name: '정말자', age: 88, diet: '유동식', room: '210호', status: 'alert' },
]

const ALERTS = [
  { type: 'warning', icon: 'ti-alert-triangle', title: '재고 부족 알림', desc: '두부, 시금치 재고가 3일치 이하입니다', time: '5분 전' },
  { type: 'danger', icon: 'ti-heart', title: '입소자 건강 이슈', desc: '정말자님 혈당 수치 확인 필요', time: '30분 전' },
  { type: 'info', icon: 'ti-info-circle', title: '식단 승인 요청', desc: '다음주 식단표 검토가 필요합니다', time: '2시간 전' },
  { type: 'warning', icon: 'ti-calendar-event', title: '영양사 회의', desc: '오후 3시 월간 식단 회의 예정', time: '3시간 전' },
]

const NUTRITION = [
  { name: '단백질', current: 78, target: 90, unit: 'g', color: 'brand' },
  { name: '탄수화물', current: 245, target: 260, unit: 'g', color: 'warning' },
  { name: '지방', current: 52, target: 65, unit: 'g', color: 'info' },
  { name: '식이섬유', current: 22, target: 28, unit: 'g', color: 'accent' },
]

export default function Dashboard() {
  const [tab, setTab] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch')

  // Line chart data (weekly calories)
  const lineData = {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    datasets: [
      {
        label: '평균 섭취 칼로리',
        data: [1820, 1750, 1890, 1920, 1850, 1780, 1830],
        borderColor: '#3d8f60',
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300)
          gradient.addColorStop(0, 'rgba(61, 143, 96, 0.28)')
          gradient.addColorStop(1, 'rgba(61, 143, 96, 0)')
          return gradient
        },
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#3d8f60',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: '권장 칼로리',
        data: [1900, 1900, 1900, 1900, 1900, 1900, 1900],
        borderColor: '#ff7a5c',
        borderWidth: 2,
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
      },
    ],
  }

  const lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#2a2a26',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 12 },
        displayColors: false,
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y} kcal`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#78786e', font: { size: 12 } },
        border: { display: false },
      },
      y: {
        grid: { color: '#f4f4f1' },
        ticks: { color: '#78786e', font: { size: 12 } },
        border: { display: false },
        min: 1600,
        max: 2100,
      },
    },
  }

  // Doughnut chart (diet type distribution)
  const dietData = {
    labels: ['일반식', '당뇨식', '저염식', '연화식', '유동식'],
    datasets: [{
      data: [24, 8, 6, 5, 2],
      backgroundColor: ['#3d8f60', '#5eab7d', '#8fc9a5', '#f5b754', '#ff7a5c'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  }
  const dietOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#2a2a26',
        padding: 12,
        cornerRadius: 8,
      },
    },
  }

  return (
    <>
      {/* 4 Stat Cards */}
      <div className="dash-grid">
        <div className="fade-in fade-in--1">
          <StatCard icon="ti-users" label="총 입소자 수" value={45} unit="명" tone="brand"
            trend={{ value: 4.5, label: '전월 대비', positive: true }} />
        </div>
        <div className="fade-in fade-in--2">
          <StatCard icon="ti-tools-kitchen-2" label="오늘 준비된 식사" value={135} unit="식" tone="success"
            trend={{ value: 2.1, label: '오늘', positive: true }} />
        </div>
        <div className="fade-in fade-in--3">
          <StatCard icon="ti-flame" label="평균 섭취 칼로리" value="1,850" unit="kcal" tone="warning"
            trend={{ value: 1.2, label: '전주 대비', positive: false }} />
        </div>
        <div className="fade-in fade-in--4">
          <StatCard icon="ti-alert-circle" label="특별 관리 대상" value={7} unit="명" tone="accent"
            trend={{ value: 12, label: '이번 주', positive: false }} />
        </div>
      </div>

      {/* Chart + Diet Distribution */}
      <div className="dash-two-col">
        <div className="card fade-in">
          <div className="card__header">
            <div>
              <div className="card__title">주간 칼로리 섭취 추이</div>
              <div className="card__subtitle">평균 섭취량과 권장 칼로리 비교</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--secondary btn--sm">
                <i className="ti ti-download" />
                내보내기
              </button>
              <select className="select" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
                <option>이번 주</option>
                <option>지난 주</option>
                <option>이번 달</option>
              </select>
            </div>
          </div>
          <div className="chart-card__body">
            <Line data={lineData} options={lineOptions} />
          </div>
          <div style={{ padding: '0 24px 20px', display: 'flex', gap: 20 }}>
            <div className="chart-legend__item">
              <span className="chart-legend__dot" style={{ background: '#3d8f60' }} />
              평균 섭취 칼로리
            </div>
            <div className="chart-legend__item">
              <span className="chart-legend__dot" style={{ background: '#ff7a5c', height: 3 }} />
              권장 칼로리 (1,900 kcal)
            </div>
          </div>
        </div>

        <div className="card fade-in fade-in--1">
          <div className="card__header">
            <div>
              <div className="card__title">식이 유형별 분포</div>
              <div className="card__subtitle">전체 입소자 45명 기준</div>
            </div>
          </div>
          <div className="chart-card__body" style={{ height: 240, position: 'relative' }}>
            <Doughnut data={dietData} options={dietOptions} />
            <div style={{
              position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              pointerEvents: 'none', textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#245c3d', lineHeight: 1 }}>45</div>
                <div style={{ fontSize: 12, color: '#78786e', marginTop: 4 }}>총 입소자</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 24px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {dietData.labels.map((label, i) => (
              <div key={label} className="chart-legend__item">
                <span className="chart-legend__dot" style={{ background: (dietData.datasets[0].backgroundColor as string[])[i] }} />
                <span style={{ flex: 1 }}>{label}</span>
                <strong style={{ color: '#2a2a26' }}>{dietData.datasets[0].data[i]}명</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Meal + Nutrition */}
      <div className="dash-two-col">
        <div className="card meal-card fade-in">
          <div className="card__header">
            <div>
              <div className="card__title">오늘의 식단</div>
              <div className="card__subtitle">2025년 3월 15일 · 총 3식 제공</div>
            </div>
            <button className="btn btn--secondary btn--sm">
              전체 보기 <i className="ti ti-arrow-right" />
            </button>
          </div>
          <div className="meal-tabs">
            <button className={`meal-tab ${tab === 'breakfast' ? 'meal-tab--active' : ''}`} onClick={() => setTab('breakfast')}>
              <i className="ti ti-sunrise" /> 아침
            </button>
            <button className={`meal-tab ${tab === 'lunch' ? 'meal-tab--active' : ''}`} onClick={() => setTab('lunch')}>
              <i className="ti ti-sun" /> 점심
            </button>
            <button className={`meal-tab ${tab === 'dinner' ? 'meal-tab--active' : ''}`} onClick={() => setTab('dinner')}>
              <i className="ti ti-moon" /> 저녁
            </button>
          </div>
          <div className="meal-list">
            {MEALS[tab].map((m, i) => (
              <div key={i} className="meal-item">
                <div className="meal-item__thumb">
                  <i className="ti ti-bowl" />
                </div>
                <div className="meal-item__info">
                  <div className="meal-item__name">{m.name}</div>
                  <div className="meal-item__meta">
                    <span>{m.desc}</span>
                    <span className="badge badge--brand" style={{ padding: '1px 8px' }}>{m.tag}</span>
                  </div>
                </div>
                <div className="meal-item__cal">
                  {m.cal}<span className="meal-item__cal-unit">kcal</span>
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: 12, marginTop: 4,
              background: 'var(--bg-subtle)', borderRadius: 10,
              fontSize: 13, fontWeight: 500,
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>총 칼로리</span>
              <span style={{ color: 'var(--brand-600)', fontWeight: 700 }}>
                {MEALS[tab].reduce((s, m) => s + m.cal, 0)} kcal
              </span>
            </div>
          </div>
        </div>

        <div className="card fade-in fade-in--1">
          <div className="card__header">
            <div>
              <div className="card__title">오늘의 영양 섭취</div>
              <div className="card__subtitle">권장량 대비 달성률</div>
            </div>
            <span className="badge badge--success">
              <i className="ti ti-circle-check" /> 양호
            </span>
          </div>
          <div className="nutri-list">
            {NUTRITION.map(n => {
              const pct = Math.round((n.current / n.target) * 100)
              return (
                <div key={n.name} className="nutri-item">
                  <div className="nutri-item__head">
                    <div className="nutri-item__name">{n.name}</div>
                    <div className="nutri-item__value">
                      <strong>{n.current}</strong> / {n.target} {n.unit} · <strong>{pct}%</strong>
                    </div>
                  </div>
                  <div className="nutri-bar">
                    <div className={`nutri-bar__fill nutri-bar__fill--${n.color}`}
                         style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Residents + Alerts */}
      <div className="dash-two-col" style={{ marginBottom: 0 }}>
        <div className="card resident-list fade-in">
          <div className="card__header">
            <div>
              <div className="card__title">최근 입소자</div>
              <div className="card__subtitle">개인별 식이 관리 현황</div>
            </div>
            <button className="btn btn--ghost btn--sm">
              전체 보기 <i className="ti ti-arrow-right" />
            </button>
          </div>
          <div className="resident-list__body">
            {RESIDENTS.map((r, i) => (
              <div key={i} className="resident-row">
                <div className="resident-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {r.name[0]}
                </div>
                <div className="resident-info">
                  <div className="resident-name">{r.name}</div>
                  <div className="resident-detail">
                    {r.age}세 · {r.room} · {r.diet}
                  </div>
                </div>
                <span className={
                  r.status === 'ok' ? 'badge badge--success'
                  : r.status === 'attention' ? 'badge badge--warning'
                  : 'badge badge--danger'
                }>
                  <i className={
                    r.status === 'ok' ? 'ti ti-circle-check'
                    : r.status === 'attention' ? 'ti ti-alert-circle'
                    : 'ti ti-alert-triangle'
                  } />
                  {r.status === 'ok' ? '정상' : r.status === 'attention' ? '관찰' : '주의'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card alerts-card fade-in fade-in--1">
          <div className="card__header">
            <div>
              <div className="card__title">알림 & 공지</div>
              <div className="card__subtitle">최근 24시간 알림</div>
            </div>
            <button className="btn btn--ghost btn--sm">모두 보기</button>
          </div>
          <div className="alerts-card__body">
            {ALERTS.map((a, i) => (
              <div key={i} className="alert-item">
                <div className={`alert-item__icon ${a.type}`}>
                  <i className={`ti ${a.icon}`} />
                </div>
                <div className="alert-item__body">
                  <div className="alert-item__title">{a.title}</div>
                  <div className="alert-item__desc">{a.desc}</div>
                </div>
                <div className="alert-item__time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
