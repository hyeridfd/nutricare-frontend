import { useEffect, useState } from "react"
import { dashboardApi, DashboardSummary, ResidentRow } from "../lib/api"
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates"
import { useAuth } from "../lib/auth"

const TYPE_BADGE_CLASS: Record<string, string> = {
  "일반형": "badge-blue",
}
function badgeClassFor(label: string) {
  if (TYPE_BADGE_CLASS[label]) return TYPE_BADGE_CLASS[label]
  if (label.includes("K")) return "badge-red"
  if (label.includes("D")) return "badge-amber"
  if (label.includes("H")) return "badge-green"
  return "badge-blue"
}

export default function ResidentStatus() {
  const { facilityId } = useAuth()
  const FACILITY_ID = facilityId || ""
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [residents, setResidents] = useState<ResidentRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setSummary(null)
    setResidents(null)
    Promise.all([dashboardApi.summary(FACILITY_ID), dashboardApi.residents(FACILITY_ID)])
      .then(([s, r]) => {
        setSummary(s)
        setResidents(r)
      })
      .catch((e) => setError(e.message))
  }

  useEffect(load, [FACILITY_ID])

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  })

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">어르신 현황</div>
          <div className="page-sub">입소 어르신 전체 식사·영양 모니터링</div>
        </div>
        <div className="header-date">
          <i className="ti ti-calendar" style={{ fontSize: 13, verticalAlign: -2, marginRight: 4 }} />
          {today}
        </div>
      </div>

      {error && <ErrorState message={`데이터를 불러오지 못했습니다: ${error}`} onRetry={load} />}

      {!error && !summary && <LoadingState message="현황 데이터를 불러오는 중..." />}

      {summary && (
        <div className="metrics">
          <div className="metric-card c-blue">
            <div className="metric-icon blue"><i className="ti ti-users" /></div>
            <div className="metric-label">총 입소 어르신</div>
            <div className="metric-val blue">{summary.total_patients}명</div>
          </div>
          <div className="metric-card c-red">
            <div className="metric-icon red"><i className="ti ti-bell-exclamation" /></div>
            <div className="metric-label">영양 보강 알림</div>
            <div className="metric-val red">{summary.nutrition_alert_count}명</div>
            <div className="metric-sub">권장 섭취량 미달</div>
          </div>
          {Object.entries(summary.disease_type_distribution)
            .slice(0, 2)
            .map(([label, count]) => (
              <div className="metric-card c-blue" key={label}>
                <div className="metric-icon blue"><i className="ti ti-stethoscope" /></div>
                <div className="metric-label">{label}</div>
                <div className="metric-val blue">{count}명</div>
              </div>
            ))}
        </div>
      )}

      <div className="card">
        <div className="card-title"><i className="ti ti-list-details" /> 어르신 목록</div>

        {!error && !residents && <LoadingState />}
        {residents && residents.length === 0 && (
          <EmptyState message="등록된 입소 어르신이 없습니다." hint="환자 등록 후 다시 확인해 주세요." />
        )}
        {residents && residents.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>이름</th><th>나이</th><th>질환유형</th><th>식사형태</th><th>영양상태</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.age}</td>
                  <td><span className={`badge ${badgeClassFor(r.disease_type_label)}`}>{r.disease_type_label}</span></td>
                  <td>{r.meal_texture}</td>
                  <td>
                    <span className={`badge ${r.status === "정상" ? "badge-green" : "badge-red"}`}>
                      {r.status}
                    </span>
                    {r.alert_nutrients.length > 0 && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text3)" }}>
                        ({r.alert_nutrients.join(", ")})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
