import { useEffect, useRef, useState } from "react"
import { mealPlansApi, MealPlanRun } from "../lib/api"
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates"
import { useAuth } from "../lib/auth"

const POLL_INTERVAL_MS = 3000
const MAX_CONSECUTIVE_FAILURES = 5  // 약 15초간 연속 실패해야 중단 (일시적 네트워크 끊김 허용)

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  optimizing:      { text: "최적화 진행 중", cls: "badge-amber" },
  pending_review:  { text: "영양사 검토 대기", cls: "badge-amber" },
  approving:       { text: "승인 처리 중",   cls: "badge-amber" },
  approved:        { text: "승인 완료",      cls: "badge-green" },
  rejected:        { text: "실패 / 반려",    cls: "badge-red" },
}

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}분 ${s}초` : `${s}초`
}

const STAGE_HINT: Record<string, string> = {
  optimizing: "NSGA-II 다목적 최적화를 진행 중입니다. 어르신 수가 많을수록 오래 걸리며, 보통 2~10분 정도 소요됩니다.",
  pending_review: "최적화가 끝났습니다. 결과를 확인하고 승인해 주세요.",
  approving: "승인 후 개인별 배식량 계산과 보고서 작성을 진행 중입니다. 1분 내외 소요됩니다.",
}

export default function MentorDesign() {
  const { facilityId } = useAuth()
  const FACILITY_ID = facilityId || ""
  const [run, setRun] = useState<MealPlanRun | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const failureCountRef = useRef(0)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const startTicker = () => {
    stopTicker()
    startTimeRef.current = Date.now()
    setElapsedSec(0)
    tickerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }, 1000)
  }

  const stopTicker = () => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current)
      tickerRef.current = null
    }
  }

  const pollStatus = (runId: string) => {
    stopPolling()
    failureCountRef.current = 0
    pollRef.current = setInterval(async () => {
      try {
        const updated = await mealPlansApi.getStatus(runId)
        failureCountRef.current = 0   // 성공하면 실패 카운트 리셋
        setError(null)                // 이전 일시적 에러 메시지도 정리
        setRun(updated)
        if (updated.status === "approved" || updated.status === "rejected") {
          stopPolling()
          stopTicker()
        }
      } catch (e) {
        failureCountRef.current += 1
        // NSGA-II가 몇 분씩 걸리는 동안 Render 콜드스타트/일시적 네트워크
        // 문제로 폴링 한두 번이 실패할 수 있음 — 그때마다 멈추면 사용자가
        // 영영 결과를 못 보게 되므로, 연속 실패가 누적될 때만 중단함.
        if (failureCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
          setError(`${(e as Error).message} (연속 ${MAX_CONSECUTIVE_FAILURES}회 실패로 상태 확인을 중단했습니다)`)
          stopPolling()
          stopTicker()
        }
      }
    }, POLL_INTERVAL_MS)
  }

  useEffect(() => () => { stopPolling(); stopTicker() }, [])

  const handleRunOptimize = async () => {
    setError(null)
    setSubmitting(true)
    startTicker()
    try {
      // diseases는 더 이상 직접 선택하지 않음 — 백엔드가 시설에 등록된
      // 전체 활성 환자의 질환을 자동으로 모아 최적화 대상으로 사용함
      // (agents/facility_optimization.get_all_diseases와 동일한 원본 설계).
      const { run_id } = await mealPlansApi.run({
        facility_id: FACILITY_ID,
        auto_approve: true,
      })
      const initial = await mealPlansApi.getStatus(run_id)
      setRun(initial)
      if (initial.status !== "approved" && initial.status !== "rejected") {
        pollStatus(run_id)
      } else {
        stopTicker()
      }
    } catch (e) {
      setError((e as Error).message)
      stopTicker()
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
        <div className="card-title" style={{ marginBottom: 8, color: "var(--text1)" }}>
          <i className="ti ti-users" style={{ color: "var(--accent)" }} /> 전체 어르신 대상 최적화
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 16 }}>
          시설에 등록된 모든 어르신의 질환을 자동으로 분석해, 전원에게 안전한
          공통 식단을 설계합니다. (질환 직접 선택 불필요)
        </div>

        <div className="btn-row" style={{ marginBottom: 0 }}>
          <button
            className="btn btn-accent"
            onClick={handleRunOptimize}
            disabled={submitting || Boolean(isBusy)}
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
              <div className="opt-param-label">대상 질환 (메뉴 풀 제한 기준)</div>
              <div className="opt-param-val">
                {run.diseases_targeted?.length ? run.diseases_targeted.join(", ") : "분석 중..."}
              </div>
            </div>
            <div className="opt-param">
              <div className="opt-param-label">영양 위반도 (f1)</div>
              <div className="opt-param-val">{run.f1_violation?.toFixed(4) ?? "-"}</div>
            </div>
            <div className="opt-param">
              <div className="opt-param-label">재최적화 횟수</div>
              <div className="opt-param-val">{run.reoptimize_count}</div>
            </div>
            <div className="opt-param">
              <div className="opt-param-label">교집합 제외 질환</div>
              <div className="opt-param-val">
                {run.diseases_excluded?.length ? run.diseases_excluded.join(", ") : "없음"}
              </div>
            </div>
          </div>

          {run.dementia_patient_count > 0 && (
            <div style={{
              fontSize: 12.5, color: "var(--text2)", background: "var(--bg3)",
              borderRadius: "var(--radius-sm)", padding: "10px 12px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <i className="ti ti-brain" style={{ color: "var(--accent)" }} />
              치매 어르신 {run.dementia_patient_count}명은 메뉴 선정 단계가 아니라,
              개인별 배식 단계에서 철분·비타민 등 부족 영양소를 보강하는 방식으로
              별도 반영됩니다.
            </div>
          )}

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

          {run.status === "approved" && (
            run.report_meal_plan_url || run.report_serving_url || run.report_cooking_url ? (
              <div className="btn-row">
                {run.report_meal_plan_url && (
                  <a className="btn btn-accent" href={run.report_meal_plan_url} target="_blank" rel="noreferrer">
                    <i className="ti ti-file-spreadsheet" /> 식단표_28일.xlsx
                  </a>
                )}
                {run.report_serving_url && (
                  <a className="btn btn-accent" href={run.report_serving_url} target="_blank" rel="noreferrer">
                    <i className="ti ti-file-spreadsheet" /> 개인별_배식량.xlsx
                  </a>
                )}
                {run.report_cooking_url && (
                  <a className="btn" href={run.report_cooking_url} target="_blank" rel="noreferrer">
                    <i className="ti ti-file-text" /> 조리_지침서.txt
                  </a>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                보고서 파일을 준비하지 못했습니다. 잠시 후 새로고침해 보세요.
              </div>
            )
          )}

          {isBusy && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <LoadingState
                message={`처리 중입니다 — 경과 시간 ${formatElapsed(elapsedSec)}`}
              />
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                {STAGE_HINT[run!.status] ?? "잠시만 기다려 주세요..."}
              </div>
            </div>
          )}

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
          hint="'최적화 실행'을 누르면 전체 어르신 대상 식단이 자동 설계됩니다."
        />
      )}
    </div>
  )
}
