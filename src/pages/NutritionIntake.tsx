import { EmptyState } from "../components/StatusStates"

// TODO: 이 페이지는 KDRIs 대비 영양소 섭취율 집계 API가 아직 백엔드에 없습니다.
// servings 테이블의 expected_* 컬럼을 주간 평균으로 집계하는
// /api/dashboard/nutrition-intake 엔드포인트를 추가한 뒤 연동이 필요합니다.

export default function NutritionIntake() {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">영양소 섭취 현황</div>
          <div className="page-sub">한국 노인 영양소 섭취기준(KDRIs) 대비 주간 평균</div>
        </div>
      </div>

      <div className="card">
        <EmptyState
          message="이 페이지는 아직 백엔드와 연동되지 않았습니다."
          hint="영양소 섭취율 집계 API(/api/dashboard/nutrition-intake) 추가가 필요합니다."
        />
      </div>
    </div>
  )
}
