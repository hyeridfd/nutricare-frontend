import { useEffect, useRef, useState } from "react"
import { mealPlansApi, MealPlanRun, MealPlanRunSummary } from "../lib/api"
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates"
import { useAuth } from "../lib/auth"

const POLL_INTERVAL_MS = 3000
// [수정 — 2026-07-01] 승인(approve) 후 _finalize_run이 대량 Supabase 저장
// + Storage 업로드 + OpenAI 호출까지 순차로 처리하는데, CPU가 제한된
// 서버에서는 이게 수십 초 걸릴 수 있어 폴링이 그 사이 응답을 못 받는
// 경우가 흔함. 기존에는 연속 5회(15초) 실패만으로 바로 에러를 띄워서,
// 실제로는 서버가 정상 처리 중인데도 "Failed to fetch"로 보이는 문제가
// 있었음. 이제 두 단계로 나눔: SOFT는 부드러운 안내만 하고 폴링은 계속
// 이어가며, HARD(훨씬 김)에 도달해야 진짜로 중단하고 에러를 보여줌.
const SOFT_FAILURE_THRESHOLD = 10  // 약 30초 — "지연 중" 안내만, 계속 시도
const HARD_FAILURE_THRESHOLD = 40  // 약 2분 — 진짜로 포기하고 에러 표시
// [수정 — 2026-07-01] 승인 직후 "뒷걸음질" 폴링 결과를 무시하는 유예 시간.
// 8초는 너무 짧아 승인 처리(대량 저장+업로드+OpenAI 호출)가 그보다 오래
// 걸리면 여전히 버튼이 깜빡였음. HARD_FAILURE_THRESHOLD와 맞춰 2분으로 늘림.
const ACTION_GRACE_MS = 120000
const STORAGE_KEY_RUN_ID = "nutricare_mentor_run_id"
const STORAGE_KEY_START_TIME = "nutricare_mentor_start_time"

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

// [추가 — 2026-07-01] CPU가 무거운 상황(NSGA-II 실행 중 등)에서는 서버가
// 요청을 실제로 처리했는데도 응답만 늦게 와서 브라우저가 "Failed to
// fetch"로 처리하는 경우가 있음. approve/reject처럼 중요한 요청은
// 몇 번 재시도해 이런 일시적 네트워크 문제를 흡수함.
async function _retryFetch<T>(fn: () => Promise<T>, retries = 2, delayMs = 1500): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (i < retries) await new Promise((r) => setTimeout(r, delayMs))
    }
  }
  throw lastErr
}

// [추가 — 2026-07-01] 드롭다운에 보여줄 run 요약 라벨.
// run_id(UUID) 대신 날짜·질환·상태로 사람이 바로 알아볼 수 있게 함.
function formatRunLabel(r: MealPlanRunSummary): string {
  const dateStr = new Date(r.created_at).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  })
  const diseases = r.diseases_targeted?.length ? r.diseases_targeted.join(",") : "분석중"
  const statusText = STATUS_LABEL[r.status]?.text ?? r.status
  return `${dateStr} · ${diseases} · ${statusText}`
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
  const [history, setHistory] = useState<MealPlanRunSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stalled, setStalled] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const failureCountRef = useRef(0)
  // [추가 — 2026-07-01] 승인/재최적화 클릭 직후, approve POST가 서버에
  // 아직 반영되기 전 타이밍에 폴링이 먼저 도착해 옛 상태('pending_review')를
  // 그대로 돌려주는 경우가 있음 — 이 시각을 기록해 잠깐(8초) 동안은
  // 그런 "뒷걸음질" 폴링 결과를 무시함.
  const actionClickTimeRef = useRef<number | null>(null)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const startTicker = (resumeFromStart?: number) => {
    stopTicker()
    const startTime = resumeFromStart ?? Date.now()
    startTimeRef.current = startTime
    localStorage.setItem(STORAGE_KEY_START_TIME, String(startTime))
    setElapsedSec(Math.floor((Date.now() - startTime) / 1000))
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

  // [수정 — 2026-07-01] 기존에는 status가 approved/rejected가 되는 순간
  // run_id까지 localStorage에서 지워버려서, 완료된 결과를 보다가 다른
  // 탭으로 갔다 돌아오면 화면이 통째로 EmptyState로 리셋되는 문제가 있었음.
  // 이제 "마지막으로 보고 있던 run_id"는 완료 여부와 무관하게 유지하고,
  // 진행 중 타이머 계산에만 쓰이는 start_time만 정리함.
  const persistRunId = (runId: string) => {
    localStorage.setItem(STORAGE_KEY_RUN_ID, runId)
  }

  const clearStartTime = () => {
    localStorage.removeItem(STORAGE_KEY_START_TIME)
  }

  const clearPersistedRun = () => {
    localStorage.removeItem(STORAGE_KEY_RUN_ID)
    localStorage.removeItem(STORAGE_KEY_START_TIME)
  }

  // [추가 — 2026-07-01] 드롭다운에 쓸 최근 실행 이력 로드
  const fetchHistory = async () => {
    if (!FACILITY_ID) return
    try {
      const list = await mealPlansApi.list(FACILITY_ID)
      setHistory(list)
    } catch {
      // 이력 조회 실패는 화면 전체를 막을 정도는 아니므로 조용히 무시
    }
  }

  const pollStatus = (runId: string) => {
    stopPolling()
    failureCountRef.current = 0
    setStalled(false)
    pollRef.current = setInterval(async () => {
      try {
        const updated = await mealPlansApi.getStatus(runId)
        failureCountRef.current = 0   // 성공하면 실패 카운트 리셋
        setError(null)                // 이전 일시적 에러 메시지도 정리
        setStalled(false)

        // 승인/재최적화 클릭 직후 짧은 유예 시간 동안, 서버가 아직 요청을
        // 반영하기 전이라 옛 상태(pending_review)가 그대로 돌아오는 경우가
        // 있음 — 이걸 그대로 반영하면 방금 눌렀는데 승인 버튼이 다시
        // 나타나는 것처럼 보여 중복 클릭을 유도하므로, 이번 결과는 건너뛰고
        // 다음 폴링을 기다림.
        const clickedRecently =
          actionClickTimeRef.current !== null &&
          Date.now() - actionClickTimeRef.current < ACTION_GRACE_MS
        if (clickedRecently && updated.status === "pending_review") {
          return
        }
        actionClickTimeRef.current = null

        setRun(updated)
        if (updated.status === "approved" || updated.status === "rejected") {
          stopPolling()
          stopTicker()
          clearStartTime()
          fetchHistory()
        }
      } catch (e) {
        failureCountRef.current += 1
        // 승인 후 서버가 대량 저장/업로드로 CPU를 오래 쓰는 동안 폴링이
        // 응답을 못 받는 건 흔한 일이라, 어느 정도까지는(SOFT) 에러 없이
        // "지연 중" 정도로만 부드럽게 알리고 계속 시도함. 정말 오래(HARD)
        // 응답이 없을 때만 진짜로 포기하고 에러를 보여줌.
        if (failureCountRef.current >= SOFT_FAILURE_THRESHOLD) {
          setStalled(true)
        }
        if (failureCountRef.current >= HARD_FAILURE_THRESHOLD) {
          setError(`${(e as Error).message} (장시간 응답이 없어 상태 확인을 중단했습니다)`)
          stopPolling()
          stopTicker()
        }
      }
    }, POLL_INTERVAL_MS)
  }

  // 페이지 로드/탭 재진입 시, 이전에 시작해 둔 진행 중인 실행이 있으면
  // 자동으로 이어서 폴링. 다른 탭을 보거나 새로고침해도 진행 상황을
  // 계속 확인할 수 있게 함(실제 최적화는 Render 서버에서 계속 돌고 있으므로
  // 여기서는 그 상태를 다시 "구독"하는 것뿐임).
  useEffect(() => {
    const savedRunId = localStorage.getItem(STORAGE_KEY_RUN_ID)
    const savedStartTime = localStorage.getItem(STORAGE_KEY_START_TIME)

    fetchHistory()

    if (savedRunId) {
      mealPlansApi.getStatus(savedRunId)
        .then((updated) => {
          setRun(updated)
          if (updated.status !== "approved" && updated.status !== "rejected") {
            startTicker(savedStartTime ? Number(savedStartTime) : undefined)
            pollStatus(savedRunId)
          } else {
            clearStartTime()
          }
        })
        .catch(() => clearPersistedRun())  // 더 이상 조회 불가한 run이면 정리
    }

    return () => { stopPolling(); stopTicker() }
  }, [])

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
      persistRunId(run_id)
      fetchHistory()

      const initial = await mealPlansApi.getStatus(run_id)
      setRun(initial)
      if (initial.status !== "approved" && initial.status !== "rejected") {
        pollStatus(run_id)
      } else {
        stopTicker()
        clearStartTime()
        fetchHistory()
      }
    } catch (e) {
      // [수정 — 2026-07-01] POST /run 자체가 "Failed to fetch"로 실패해도,
      // CPU가 무거운 상황에서는 서버가 실제로 run을 생성해 백그라운드로
      // 돌리고 있는데 응답만 못 받았을 가능성이 있음. approve/reject와
      // 달리 이 요청은 멱등(idempotent)하지 않아 무작정 재시도하면
      // 중복 실행이 생길 위험이 있으므로, 재시도 대신 최근 실행 이력을
      // 다시 조회해 "방금 막 생성된 것으로 보이는 run"이 있는지 확인함.
      // 있으면 그 run을 이어서 표시하고, 없으면(진짜로 실패한 경우)만
      // 에러를 보여줌.
      try {
        const list = await mealPlansApi.list(FACILITY_ID)
        setHistory(list)
        const justStarted = list.find((r) => {
          const ageSec = (Date.now() - new Date(r.created_at).getTime()) / 1000
          return ageSec < 30 && r.status === "optimizing"
        })
        if (justStarted) {
          console.warn("[MentorDesign] /run 응답을 못 받았지만 서버에 새 실행이 생성된 것을 확인해 이어서 표시합니다.")
          await handleSelectRun(justStarted.id)
        } else {
          setError((e as Error).message)
          stopTicker()
          clearPersistedRun()
        }
      } catch {
        setError((e as Error).message)
        stopTicker()
        clearPersistedRun()
      }
    } finally {
      setSubmitting(false)
    }
  }

  // [수정 — 2026-07-01] approve 요청이 네트워크 오류로 실패하면 바로
  // "Failed to fetch" 에러 배너를 띄우던 기존 방식은, CPU가 무거운
  // 상황에서 실제로는 서버가 요청을 받아 처리 중인데도 사용자에게
  // "완전히 실패한 것"처럼 보이게 해서 재클릭을 유도하는 문제가 있었음.
  // 이제는 클릭 즉시 낙관적으로 "처리 중" 상태로 전환해 로딩 화면을
  // 보여주고, 폴링을 바로 시작함 — 실제 서버 상태(진짜 성공/실패 여부)는
  // 몇 초 뒤 폴링 결과가 정확히 알려주므로, approve 요청 자체가
  // 재시도 끝에 최종 실패하더라도 에러 배너를 바로 띄우지 않고 폴링에
  // 판단을 맡김. 폴링이 계속 'pending_review'를 보여주면(진짜 실패라면)
  // 사용자는 자연히 승인/재최적화 버튼이 다시 나타난 것을 보고 재시도할 수 있음.
  const handleApprove = async () => {
    if (!run) return
    setError(null)
    actionClickTimeRef.current = Date.now()
    setRun({ ...run, status: "approving" })
    startTicker()
    pollStatus(run.id)
    try {
      await _retryFetch(() => mealPlansApi.approve(run.id))
      fetchHistory()
    } catch (e) {
      console.warn("[MentorDesign] approve 요청 응답을 못 받았지만 폴링으로 상태를 계속 확인합니다:", e)
    }
  }

  const handleReject = async () => {
    if (!run) return
    setError(null)
    actionClickTimeRef.current = Date.now()
    setRun({ ...run, status: "optimizing" })
    startTicker()
    pollStatus(run.id)
    try {
      await _retryFetch(() => mealPlansApi.reject(run.id))
      fetchHistory()
    } catch (e) {
      console.warn("[MentorDesign] reject 요청 응답을 못 받았지만 폴링으로 상태를 계속 확인합니다:", e)
    }
  }

  // [추가 — 2026-07-01] 드롭다운에서 과거 실행을 선택했을 때: 해당 run을
  // 불러와 화면에 표시. 아직 진행 중인 run이면 폴링을 이어서 시작함.
  const handleSelectRun = async (runId: string) => {
    if (!runId) return
    stopPolling()
    stopTicker()
    setError(null)
    try {
      const selected = await mealPlansApi.getStatus(runId)
      setRun(selected)
      persistRunId(runId)
      if (selected.status === "optimizing" || selected.status === "approving") {
        startTicker()
        pollStatus(runId)
      } else {
        clearStartTime()
      }
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

        <div className="btn-row" style={{ marginBottom: 0, alignItems: "center", gap: 10 }}>
          <button
            className="btn btn-accent"
            onClick={handleRunOptimize}
            disabled={submitting || Boolean(isBusy)}
          >
            <i className="ti ti-sparkles" />
            {submitting || isBusy ? "최적화 진행 중..." : "최적화 실행"}
          </button>

          {history.length > 0 && (
            <select
              value={run?.id ?? ""}
              onChange={(e) => handleSelectRun(e.target.value)}
              style={{
                fontSize: 12.5, padding: "8px 10px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)", background: "var(--bg2)",
                color: "var(--text1)", maxWidth: 320,
              }}
            >
              <option value="" disabled>이전 실행 기록 보기</option>
              {history.map((r) => (
                <option key={r.id} value={r.id}>{formatRunLabel(r)}</option>
              ))}
            </select>
          )}
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
              {stalled && (
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
                  서버 응답이 잠시 지연되고 있습니다. 계속 확인 중이니 조금만 더 기다려 주세요.
                </div>
              )}
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
