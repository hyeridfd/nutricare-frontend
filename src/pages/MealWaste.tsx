import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from "chart.js"
import { dashboardApi } from "../lib/api"
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates"
import { useAuth } from "../lib/auth"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function MealWaste() {
  const { facilityId } = useAuth()
  const FACILITY_ID = facilityId || ""
  const [data, setData] = useState<{
    by_disease_type: Record<string, number>
    by_meal: Record<string, number>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setData(null)
    dashboardApi.mealWaste(FACILITY_ID).then(setData).catch((e) => setError(e.message))
  }

  useEffect(load, [FACILITY_ID])

  const hasData = data && Object.keys(data.by_disease_type).length > 0

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">식사·잔반 현황</div>
          <div className="page-sub">최근 7일 끼니별·질환유형별 잔반율</div>
        </div>
      </div>

      {error && <ErrorState message={`데이터를 불러오지 못했습니다: ${error}`} onRetry={load} />}
      {!error && !data && <LoadingState />}
      {data && !hasData && (
        <EmptyState message="최근 잔반 기록이 없습니다." hint="잔반 입력 후 다시 확인해 주세요." />
      )}

      {hasData && (
        <div className="cards-row gap-14">
          <div className="card">
            <div className="card-title"><i className="ti ti-chart-bar" /> 끼니별 잔반율</div>
            <div className="chart-wrap" style={{ height: 220 }}>
              <Bar
                data={{
                  labels: Object.keys(data.by_meal),
                  datasets: [{
                    label: "잔반율 (%)",
                    data: Object.values(data.by_meal),
                    backgroundColor: "rgba(79,142,247,0.5)",
                    borderColor: "#4f8ef7",
                    borderWidth: 1,
                    borderRadius: 5,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100 } },
                }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title"><i className="ti ti-chart-bar" /> 질환유형별 잔반율</div>
            <div className="chart-wrap" style={{ height: 220 }}>
              <Bar
                data={{
                  labels: Object.keys(data.by_disease_type),
                  datasets: [{
                    label: "잔반율 (%)",
                    data: Object.values(data.by_disease_type),
                    backgroundColor: "rgba(45,212,191,0.5)",
                    borderColor: "#2dd4bf",
                    borderWidth: 1,
                    borderRadius: 5,
                  }],
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100 } },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
