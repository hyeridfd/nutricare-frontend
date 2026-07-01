import './inventory.css'

const INVENTORY = [
  { name: '쌀 (10kg)', category: '곡물', stock: 25, unit: '포', min: 10, status: 'ok', icon: 'ti-wheat', color: '#e89b1e' },
  { name: '두부', category: '단백질', stock: 3, unit: '모', min: 8, status: 'danger', icon: 'ti-cheese', color: '#3d8f60' },
  { name: '시금치', category: '채소', stock: 5, unit: 'kg', min: 8, status: 'warning', icon: 'ti-plant', color: '#22a06b' },
  { name: '닭가슴살', category: '단백질', stock: 12, unit: 'kg', min: 5, status: 'ok', icon: 'ti-meat', color: '#c34527' },
  { name: '갈치', category: '수산물', stock: 8, unit: 'kg', min: 5, status: 'ok', icon: 'ti-fish', color: '#3b82c4' },
  { name: '당근', category: '채소', stock: 6, unit: 'kg', min: 4, status: 'ok', icon: 'ti-carrot', color: '#ea5a3c' },
  { name: '계란 (30구)', category: '단백질', stock: 4, unit: '판', min: 6, status: 'warning', icon: 'ti-egg', color: '#f5b754' },
  { name: '우유 (1L)', category: '유제품', stock: 15, unit: '팩', min: 10, status: 'ok', icon: 'ti-milk', color: '#6ba3d0' },
  { name: '미역', category: '해조류', stock: 2, unit: 'kg', min: 3, status: 'warning', icon: 'ti-plant-2', color: '#245c3d' },
  { name: '된장', category: '조미료', stock: 8, unit: 'kg', min: 3, status: 'ok', icon: 'ti-bottle', color: '#a56b0d' },
]

export default function Inventory() {
  const total = INVENTORY.length
  const low = INVENTORY.filter(i => i.status === 'warning' || i.status === 'danger').length
  const critical = INVENTORY.filter(i => i.status === 'danger').length

  return (
    <>
      <div className="inv-summary fade-in">
        <div className="card inv-stat inv-stat--brand">
          <div className="inv-stat__icon"><i className="ti ti-package" /></div>
          <div>
            <div className="inv-stat__val">{total}</div>
            <div className="inv-stat__label">전체 품목</div>
          </div>
        </div>
        <div className="card inv-stat inv-stat--warning">
          <div className="inv-stat__icon"><i className="ti ti-alert-triangle" /></div>
          <div>
            <div className="inv-stat__val">{low}</div>
            <div className="inv-stat__label">재고 부족</div>
          </div>
        </div>
        <div className="card inv-stat inv-stat--danger">
          <div className="inv-stat__icon"><i className="ti ti-alert-octagon" /></div>
          <div>
            <div className="inv-stat__val">{critical}</div>
            <div className="inv-stat__label">긴급 발주 필요</div>
          </div>
        </div>
        <div className="card inv-stat inv-stat--info">
          <div className="inv-stat__icon"><i className="ti ti-truck-delivery" /></div>
          <div>
            <div className="inv-stat__val">3</div>
            <div className="inv-stat__label">진행 중 발주</div>
          </div>
        </div>
      </div>

      <div className="card fade-in fade-in--1">
        <div className="card__header">
          <div>
            <div className="card__title">식자재 재고 현황</div>
            <div className="card__subtitle">최근 업데이트: 2025년 3월 15일 09:20</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--secondary btn--sm">
              <i className="ti ti-search" /> 검색
            </button>
            <button className="btn btn--secondary btn--sm">
              <i className="ti ti-filter" /> 필터
            </button>
            <button className="btn btn--primary btn--sm">
              <i className="ti ti-plus" /> 품목 추가
            </button>
          </div>
        </div>

        <div className="inv-grid">
          {INVENTORY.map((item, i) => {
            const pct = Math.min((item.stock / (item.min * 2)) * 100, 100)
            return (
              <div key={i} className="inv-card">
                <div className="inv-card__head">
                  <div className="inv-card__icon" style={{ background: `${item.color}1a`, color: item.color }}>
                    <i className={`ti ${item.icon}`} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="inv-card__name">{item.name}</div>
                    <div className="inv-card__cat">{item.category}</div>
                  </div>
                  <span className={
                    item.status === 'ok' ? 'badge badge--success'
                    : item.status === 'warning' ? 'badge badge--warning'
                    : 'badge badge--danger'
                  }>
                    {item.status === 'ok' ? '충분' : item.status === 'warning' ? '부족' : '긴급'}
                  </span>
                </div>
                <div className="inv-card__stock">
                  <span className="inv-card__stock-num">{item.stock}</span>
                  <span className="inv-card__stock-unit">{item.unit}</span>
                  <span className="inv-card__stock-min">최소 {item.min}{item.unit}</span>
                </div>
                <div className="inv-card__bar">
                  <div className="inv-card__bar-fill" style={{
                    width: `${pct}%`,
                    background: item.status === 'ok' ? 'var(--success)'
                              : item.status === 'warning' ? 'var(--warning)'
                              : 'var(--danger)',
                  }} />
                </div>
                {(item.status === 'warning' || item.status === 'danger') && (
                  <button className="btn btn--secondary btn--sm" style={{ width: '100%', marginTop: 12 }}>
                    <i className="ti ti-shopping-cart" /> 발주하기
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
