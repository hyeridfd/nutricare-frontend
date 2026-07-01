import { useEffect, useState } from "react"
import { dashboardApi, NutritionIntakeResponse } from "../lib/api"
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates"
import { useAuth } from "../lib/auth"

const NUTRIENT_LABELS: Record<string, { label: string; unit: string }> = {
  energy:  { label: "열량",   unit: "kcal" },
  protein: { label: "단백질", unit: "g" },
  carb:    { label: "탄수화물", unit: "g" },
  sodium:  { label: "나트륨", unit: "mg" },
}

export default function NutritionIntake() {
  const { facilityId } = useAuth()
  const FACILITY_ID = facilityId || ""
  const [data, setData] = useState<NutritionIntakeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setData(null)
    dashboardApi.nutritionIntake(FACILITY_ID).then(setData).catch((e) => setError(e.message))
  }

  useEffect(load, [FACILITY_ID])

  const hasData = data && Object.keys(data.by_nutrient).length > 0

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">영양소 섭취 현황</div>
          <div className="page-sub">한국 노인 영양소 섭취기준(KDRIs) 대비 주간 평균 — 잔반 기록 기반 환산</div>
        </div>
      </div>

      {error && <ErrorState message={`데이터를 불러오지 못했습니다: ${error}`} onRetry={load} />}
      {!error && !data && <LoadingState />}
      {data && !hasData && (
        <EmptyState
          message="최근 잔반 기록이 없어 섭취량을 계산할 수 없습니다."
          hint="잔반을 입력하면 자동으로 섭취 영양소가 환산되어 표시됩니다."
        />
      )}

      {hasData && (
        <>
          <div className="metrics">
            {Object.entries(data.by_nutrient).map(([key, n]) => {
              const meta = NUTRIENT_LABELS[key] || { label: key, unit: "" }
              const isLow = n.pct_of_target < 80
              return (
                <div className={`metric-card ${isLow ? "c-red" : "c-blue"}`} key={key}>
                  <div className={`metric-icon ${isLow ? "red" : "blue"}`}>
                    <i className="ti ti-chart-donut" />
                  </div>
                  <div className="metric-label">{meta.label}</div>
                  <div className={`metric-val ${isLow ? "red" : "blue"}`}>
                    {n.facility_avg.toLocaleString()} {meta.unit}
                  </div>
                  <div className="metric-sub">
                    기준 {n.target.toLocaleString()}{meta.unit} 대비 {n.pct_of_target}%
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card">
            <div className="card-title"><i className="ti ti-list-details" /> 어르신별 섭취 현황</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>이름</th><th>평균 열량</th><th>평균 단백질</th>
                  <th>평균 탄수화물</th><th>평균 나트륨</th><th>기준 대비</th><th>상태</th>
                </tr>
              </thead>
              <tbody>
                {data.by_patient.map((p) => (
                  <tr key={p.patient_id}>
                    <td>{p.patient_name}</td>
                    <td>{p.avg_energy_kcal.toLocaleString()} kcal</td>
                    <td>{p.avg_protein_g.toLocaleString()} g</td>
                    <td>{p.avg_carb_g.toLocaleString()} g</td>
                    <td>{p.avg_sodium_mg.toLocaleString()} mg</td>
                    <td>{p.energy_pct_of_target}%</td>
                    <td>
                      <span className={`badge ${p.is_deficit ? "badge-red" : "badge-green"}`}>
                        {p.is_deficit ? "부족" : "정상"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
