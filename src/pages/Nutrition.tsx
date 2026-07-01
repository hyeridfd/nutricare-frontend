import { Bar, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
  RadialLinearScale, PointElement, LineElement, Filler,
} from 'chart.js'
import './nutrition.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler)

export default function Nutrition() {
  const barData = {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    datasets: [
      { label: '탄수화물 (g)', data: [240, 260, 250, 245, 255, 235, 250], backgroundColor: '#8fc9a5', borderRadius: 8 },
      { label: '단백질 (g)', data: [78, 82, 80, 85, 79, 88, 84], backgroundColor: '#3d8f60', borderRadius: 8 },
      { label: '지방 (g)', data: [52, 55, 50, 48, 53, 51, 54], backgroundColor: '#ff7a5c', borderRadius: 8 },
    ],
  }
  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top', align: 'end',
        labels: { boxWidth: 10, boxHeight: 10, padding: 16, font: { size: 12 }, usePointStyle: true, pointStyle: 'rectRounded' },
      },
      tooltip: { backgroundColor: '#2a2a26', padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#78786e' }, border: { display: false } },
      y: { grid: { color: '#f4f4f1' }, ticks: { color: '#78786e' }, border: { display: false } },
    },
  }

  const radarData = {
    labels: ['단백질', '탄수화물', '지방', '식이섬유', '칼슘', '철분', '비타민C', '비타민D'],
    datasets: [
      {
        label: '섭취량',
        data: [85, 92, 78, 88, 72, 68, 95, 62],
        backgroundColor: 'rgba(61, 143, 96, 0.18)',
        borderColor: '#3d8f60', borderWidth: 2,
        pointBackgroundColor: '#3d8f60', pointRadius: 4,
      },
      {
        label: '권장량',
        data: [100, 100, 100, 100, 100, 100, 100, 100],
        backgroundColor: 'rgba(255, 122, 92, 0.05)',
        borderColor: '#ff7a5c', borderWidth: 2, borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  }
  const radarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 12 }, usePointStyle: true } },
      tooltip: { backgroundColor: '#2a2a26', padding: 12, cornerRadius: 8 },
    },
    scales: {
      r: {
        min: 0, max: 120,
        ticks: { display: false, stepSize: 20 },
        grid: { color: '#e8e8e3' },
        angleLines: { color: '#e8e8e3' },
        pointLabels: { font: { size: 12, weight: '500' }, color: '#565650' },
      },
    },
  }

  return (
    <>
      <div className="nut-summary fade-in">
        {[
          { icon: 'ti-flame', label: '평균 섭취 칼로리', val: '1,847', unit: 'kcal', target: '1,900 kcal', pct: 97 },
          { icon: 'ti-meat', label: '단백질 달성률', val: '85', unit: '%', target: '목표 90g', pct: 85 },
          { icon: 'ti-plant', label: '식이섬유 달성률', val: '88', unit: '%', target: '목표 28g', pct: 88 },
          { icon: 'ti-droplet', label: '수분 섭취량', val: '1.6', unit: 'L', target: '목표 2.0L', pct: 80 },
        ].map((s, i) => (
          <div key={i} className="card nut-summary-card">
            <div className="nut-summary-head">
              <i className={`ti ${s.icon}`} />
              <div className="nut-summary-label">{s.label}</div>
            </div>
            <div className="nut-summary-val">{s.val}<span>{s.unit}</span></div>
            <div className="nut-summary-target">{s.target}</div>
            <div className="nut-progress">
              <div className="nut-progress__fill" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="nut-charts fade-in fade-in--1">
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">주간 3대 영양소 섭취량</div>
              <div className="card__subtitle">탄수화물 · 단백질 · 지방 (평균)</div>
            </div>
          </div>
          <div style={{ padding: 24, height: 340 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">영양소 균형 지표</div>
              <div className="card__subtitle">권장량 대비 실제 섭취량</div>
            </div>
          </div>
          <div style={{ padding: 24, height: 340 }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>

      <div className="card fade-in fade-in--2" style={{ marginTop: 20 }}>
        <div className="card__header">
          <div>
            <div className="card__title">입소자별 영양 섭취 분석</div>
            <div className="card__subtitle">최근 7일 평균 · 45명 중 상위 8명</div>
          </div>
          <button className="btn btn--secondary btn--sm">
            <i className="ti ti-download" /> 리포트 다운로드
          </button>
        </div>
        <div className="nut-table-wrap">
          <table className="nut-table">
            <thead>
              <tr>
                <th>입소자</th>
                <th>식이 유형</th>
                <th>평균 칼로리</th>
                <th>단백질</th>
                <th>탄수화물</th>
                <th>지방</th>
                <th>달성률</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: '박순자', diet: '당뇨식', cal: 1780, p: 82, c: 240, f: 48, pct: 94, status: 'ok' },
                { name: '김영수', diet: '저염식', cal: 1920, p: 88, c: 260, f: 52, pct: 101, status: 'ok' },
                { name: '이금자', diet: '연화식', cal: 1620, p: 68, c: 220, f: 44, pct: 85, status: 'warning' },
                { name: '최영희', diet: '일반식', cal: 1850, p: 84, c: 250, f: 51, pct: 97, status: 'ok' },
                { name: '정말자', diet: '유동식', cal: 1420, p: 58, c: 195, f: 38, pct: 74, status: 'danger' },
                { name: '홍길동', diet: '일반식', cal: 1950, p: 90, c: 265, f: 55, pct: 102, status: 'ok' },
                { name: '강복순', diet: '당뇨식', cal: 1760, p: 80, c: 235, f: 47, pct: 92, status: 'ok' },
                { name: '오영자', diet: '저염식', cal: 1810, p: 82, c: 245, f: 49, pct: 95, status: 'ok' },
              ].map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.name}</strong></td>
                  <td><span className="badge badge--brand">{r.diet}</span></td>
                  <td>{r.cal.toLocaleString()} kcal</td>
                  <td>{r.p}g</td>
                  <td>{r.c}g</td>
                  <td>{r.f}g</td>
                  <td>
                    <div className="nut-table-progress">
                      <div className="nut-table-progress__bar">
                        <div className="nut-table-progress__fill"
                             style={{ width: `${Math.min(r.pct, 100)}%`, background:
                               r.pct >= 90 ? 'var(--success)' :
                               r.pct >= 80 ? 'var(--warning)' : 'var(--danger)' }} />
                      </div>
                      <span>{r.pct}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={
                      r.status === 'ok' ? 'badge badge--success'
                      : r.status === 'warning' ? 'badge badge--warning'
                      : 'badge badge--danger'
                    }>
                      {r.status === 'ok' ? '양호' : r.status === 'warning' ? '관찰' : '주의'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
