interface Props {
  icon: string
  label: string
  value: string | number
  unit?: string
  trend?: { value: number; label: string; positive?: boolean }
  tone?: 'brand' | 'success' | 'warning' | 'info' | 'accent'
}

const TONE_STYLE: Record<string, { bg: string; color: string }> = {
  brand:   { bg: 'linear-gradient(135deg,#dcf0e2 0%,#bce0c9 100%)', color: '#245c3d' },
  success: { bg: 'linear-gradient(135deg,#e8f7ef 0%,#c9edd7 100%)', color: '#1a7a4f' },
  warning: { bg: 'linear-gradient(135deg,#fef3e0 0%,#fbe0b3 100%)', color: '#a56b0d' },
  info:    { bg: 'linear-gradient(135deg,#e6f1f9 0%,#c9def0 100%)', color: '#2a6a9c' },
  accent:  { bg: 'linear-gradient(135deg,#ffe4dc 0%,#ffcbb8 100%)', color: '#c34527' },
}

export default function StatCard({ icon, label, value, unit, trend, tone = 'brand' }: Props) {
  const style = TONE_STYLE[tone]
  return (
    <div className="stat-card card card--hover">
      <div className="stat-card__icon" style={{ background: style.bg, color: style.color }}>
        <i className={`ti ${icon}`} />
      </div>
      <div className="stat-card__body">
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value-row">
          <div className="stat-card__value">{value}</div>
          {unit && <div className="stat-card__unit">{unit}</div>}
        </div>
        {trend && (
          <div className={`stat-card__trend ${trend.positive ? 'up' : 'down'}`}>
            <i className={`ti ${trend.positive ? 'ti-trending-up' : 'ti-trending-down'}`} />
            <span>{trend.positive ? '+' : ''}{trend.value}%</span>
            <span className="stat-card__trend-label">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
