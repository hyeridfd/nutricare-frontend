import { useEffect, useState } from "react"
import {
  preferencesApi, FacilityPreferenceResponse,
  PatientPreferenceSummary, PatientPreferenceDetail,
} from "../lib/api"
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates"
import { useAuth } from "../lib/auth"

function scoreBadge(score: number) {
  if (score < 0.5) return <span className="badge badge-red">기피</span>
  if (score >= 0.8) return <span className="badge badge-green">선호</span>
  return <span className="badge badge-amber">보통</span>
}

export default function Preferences() {
  const { facilityId } = useAuth()
  const FACILITY_ID = facilityId || ""

  const [facilityPrefs, setFacilityPrefs] = useState<FacilityPreferenceResponse | null>(null)
  const [patientSummaries, setPatientSummaries] = useState<PatientPreferenceSummary[] | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patientDetail, setPatientDetail] = useState<PatientPreferenceDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadOverview = () => {
    setError(null)
    setFacilityPrefs(null)
    setPatientSummaries(null)
    Promise.all([
      preferencesApi.facility(FACILITY_ID),
      preferencesApi.patientsList(FACILITY_ID),
    ])
      .then(([fp, ps]) => {
        setFacilityPrefs(fp)
        setPatientSummaries(ps.patients)
      })
      .catch((e) => setError(e.message))
  }

  useEffect(loadOverview, [FACILITY_ID])

  useEffect(() => {
    if (!selectedPatient) {
      setPatientDetail(null)
      return
    }
    preferencesApi.patientDetail(FACILITY_ID, selectedPatient)
      .then(setPatientDetail)
      .catch((e) => setError(e.message))
  }, [selectedPatient, FACILITY_ID])

  const hasFacilityData = facilityPrefs && facilityPrefs.items.length > 0
  const hasPatientData = patientSummaries && patientSummaries.length > 0

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">선호도 확인</div>
          <div className="page-sub">잔반 기록 기반 학습된 메뉴 선호도 — 다음 식단 최적화에 자동 반영됩니다</div>
        </div>
      </div>

      {error && <ErrorState message={`데이터를 불러오지 못했습니다: ${error}`} onRetry={loadOverview} />}
      {!error && !facilityPrefs && <LoadingState />}

      {facilityPrefs && !hasFacilityData && (
        <EmptyState
          message="아직 선호도 데이터가 없습니다."
          hint="잔반을 입력하고 식단 설계를 한 번 더 실행하면 선호도가 학습됩니다."
        />
      )}

      {hasFacilityData && (
        <>
          <div className="metrics">
            <div className="metric-card c-red">
              <div className="metric-icon red"><i className="ti ti-thumb-down" /></div>
              <div className="metric-label">시설 기피 메뉴</div>
              <div className="metric-val red">{facilityPrefs.dislike_count}개</div>
            </div>
            <div className="metric-card c-blue">
              <div className="metric-icon blue"><i className="ti ti-thumb-up" /></div>
              <div className="metric-label">시설 선호 메뉴</div>
              <div className="metric-val blue">{facilityPrefs.like_count}개</div>
            </div>
          </div>

          <div className="cards-row gap-14">
            <div className="card">
              <div className="card-title"><i className="ti ti-chart-bar" /> 시설 전체 메뉴 선호도</div>
              <table className="data-table">
                <thead>
                  <tr><th>메뉴명</th><th>점수</th><th>구분</th></tr>
                </thead>
                <tbody>
                  {facilityPrefs.items.map((item) => (
                    <tr key={item.menu_name}>
                      <td>{item.menu_name}</td>
                      <td>{item.score.toFixed(2)}</td>
                      <td>{scoreBadge(item.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="card-title"><i className="ti ti-users" /> 어르신별 선호도 요약</div>
              {!hasPatientData && <EmptyState message="개인별 선호도 데이터가 없습니다." />}
              {hasPatientData && (
                <table className="data-table">
                  <thead>
                    <tr><th>이름</th><th>기피</th><th>선호</th><th></th></tr>
                  </thead>
                  <tbody>
                    {patientSummaries!.map((p) => (
                      <tr
                        key={p.patient_id}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedPatient(p.patient_id)}
                      >
                        <td>{p.patient_name}</td>
                        <td>{p.dislike_count}개</td>
                        <td>{p.like_count}개</td>
                        <td><i className="ti ti-chevron-right" style={{ color: "var(--text3)" }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {selectedPatient && patientDetail && (
        <div className="card gap-14" style={{ marginTop: 14 }}>
          <div className="card-title" style={{ display: "flex", justifyContent: "space-between" }}>
            <span><i className="ti ti-user" /> {patientDetail.patient_name}님의 메뉴 선호도</span>
            <button className="btn" onClick={() => setSelectedPatient(null)}>
              <i className="ti ti-x" /> 닫기
            </button>
          </div>
          {patientDetail.items.length === 0 ? (
            <EmptyState message="아직 이 어르신의 선호도 데이터가 없습니다." />
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>메뉴명</th><th>점수</th><th>구분</th></tr>
              </thead>
              <tbody>
                {patientDetail.items.map((item) => (
                  <tr key={item.menu_name}>
                    <td>{item.menu_name}</td>
                    <td>{item.score.toFixed(2)}</td>
                    <td>{scoreBadge(item.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
