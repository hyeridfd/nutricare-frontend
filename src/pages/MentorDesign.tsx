import { useEffect, useRef, useState } from "react"
import { mealPlansApi, MealPlanRun } from "../lib/api"
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates"

const FACILITY_ID = import.meta.env.VITE_FACILITY_ID || ""
const DISEASE_OPTIONS = ["고혈압", "당뇨병", "신장질환", "치매"]
const POLL_INTERVAL_MS = 3000

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  optimizing:      { text: "최적화 진행 중", cls: "badge-amber" },
  pending_review:  { text: "영양사 검토 대기", cls: "badge-amber" },
  approving:       { text: "승인 처리 중",   cls: "badge-amber" },
  approved:        { text: "승인 완료",      cls: "badge-green" },
  rejected:        { text: "실패 / 반려",    cls: "badge-red" },
}

export default function MentorDesign() {
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(["고혈압", "당뇨병"])
  const [run, setRun] = useState<MealPlanRun | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const pollStatus = (runId: string) => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const updated = await mealPlansApi.getStatus(runId)
        setRun(updated)
        if (updated.status === "approved" || updated.status === "rejected") {
          stopPolling()
        }
      } catch (e) {
        setError((e as Error).message)
        stopPolling()
      }
    }, POLL_INTERVAL_MS)
  }

  useEffect(() => stopPolling, [])

  const toggleDisease = (d: string) => {
    setSelectedDiseases((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  const handleRunOptimize = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const { run_id } = await mealPlansApi.run({
        facility_id: FACILITY_ID,
        diseases: selectedDiseases,
        auto_approve: true,
      })
      const initial = await mealPlansApi.getStatus(run_id)
      setRun(initial)
      if (initial.status !== "approved" && initial.status !== "rejected") {
        pollStatus(run_id)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!run) return
    try {
      await mealPlansApi.approve(run.id)
      pollStatus(run.id)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleReject = async () => {
    if (!run) return
    try {
      await mealPlansApi.reject(run.id)
      pollStatus(run.id)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const status = run ? STATUS_LABEL[run.status] : null
  const isBusy = run && (run.status === "optimizing" || run.status === "approving")

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">MENTOR 식단 설계</div>
          <div className="page-sub">NSGA-II 기반 다목적 최적화 · 영양·기호도·비용 동시 최적화</div>
        </div>
      </div>

      <div className="optimizer-box">
        <div className="card-title" style={{ marginBottom: 12, color: "var(--text1)" }}>
          <i className="ti ti-settings" style={{ color: "var(--accent)" }} /> 대상 질환 선택
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {DISEASE_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => toggleDisease(d)}
              className="btn"
              style={{
                background: selectedDiseases.includes(d) ? "var(--accent)" : undefined,
                color: selectedDiseases.includes(d) ? "#fff" : undefined,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="btn-row" style={{ marginBottom: 0 }}>
          <button
            className="btn btn-accent"
            onClick={handleRunOptimize}
            disabled={submitting || isBusy || selectedDiseases.length === 0}
          >
            <i className="ti ti-sparkles" />
            {submitting || isBusy ? "최적화 진행 중..." : "최적화 실행"}
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      {run && (
        <div className="card gap-14">
          <div className="card-title" style={{ display: "flex", justifyContent: "space-between" }}>
            <span><i className="ti ti-list-check" /> 실행 상태</span>
            {status && <span className={`badge ${status.cls}`}>{status.text}</span>}
          </div>

          <div className="opt-params">
            <div className="opt-param">
              <div className="opt-param-label">영양 위반도 (f1)</div>
              <div className="opt-param-val">{run.f1_violation?.toFixed(4) ?? "-"}</div>
            </div>
            <div className="opt-param">
              <div className="opt-param-label">재최적화 횟수</div>
              <div className="opt-param-val">{run.reoptimize_count}</div>
            </div>
            <div className="opt-param">
              <div className="opt-param-label">제외 질환</div>
              <div className="opt-param-val">
                {run.diseases_excluded?.length ? run.diseases_excluded.join(", ") : "없음"}
              </div>
            </div>
          </div>

          {run.status === "pending_review" && (
            <div className="btn-row">
              <button className="btn btn-green" onClick={handleApprove}>
                <i className="ti ti-check" /> 승인
              </button>
              <button className="btn btn-amber" onClick={handleReject}>
                <i className="ti ti-refresh" /> 재최적화 요청
              </button>
            </div>
          )}

          {isBusy && <LoadingState message="처리 중입니다. 잠시만 기다려 주세요..." />}

          {run.meal_plan_slots && run.meal_plan_slots.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>일차</th><th>끼니</th><th>밥</th><th>국</th><th>주찬</th>
                    <th>부찬1</th><th>부찬2</th><th>김치</th>
                    <th>열량</th><th>나트륨</th><th>단백질</th>
                  </tr>
                </thead>
                <tbody>
                  {run.meal_plan_slots.slice(0, 21).map((s, i) => (
                    <tr key={i}>
                      <td>{s.day_number}일</td>
                      <td>{s.meal_type}</td>
                      <td>{s.rice}</td>
                      <td>{s.soup}</td>
                      <td>{s.main_dish}</td>
                      <td>{s.side_dish_1}</td>
                      <td>{s.side_dish_2}</td>
                      <td>{s.kimchi}</td>
                      <td>{s.energy_kcal?.toFixed(0)}</td>
                      <td>{s.sodium_mg?.toFixed(0)}</td>
                      <td>{s.protein_g?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {run.meal_plan_slots.length > 21 && (
                <div style={{ textAlign: "center", padding: 10, color: "var(--text3)", fontSize: 12 }}>
                  처음 7일(21끼)만 표시됩니다. 전체 28일 식단은 발주 엑셀 페이지에서 확인하세요.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!run && !error && (
        <EmptyState
          message="아직 생성된 식단이 없습니다."
          hint="대상 질환을 선택하고 '최적화 실행'을 눌러 시작하세요."
        />
      )}
    </div>
  )
}
