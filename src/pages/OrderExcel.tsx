import { useState } from "react"
import { ordersApi } from "../lib/api"
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates"

interface OrderItem {
  menu_name: string
  ingredient: string
  servings_used: number
  total_weight_g: number
  product_name: string | null
  unit_price: number | null
  estimated_cost: number | null
}
interface OrderPreview {
  run_id: string
  week_range: string
  total_items: number
  total_cost: number
  items: OrderItem[]
}

export default function OrderExcel() {
  const [runId, setRunId] = useState("")
  const [weekOffset, setWeekOffset] = useState(0)
  const [preview, setPreview] = useState<OrderPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePreview = async () => {
    if (!runId.trim()) {
      setError("식단 실행 ID(run_id)를 입력해 주세요.")
      return
    }
    setError(null)
    setLoading(true)
    setPreview(null)
    try {
      const data = await ordersApi.preview(runId, weekOffset) as OrderPreview
      setPreview(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">발주 엑셀 생성</div>
          <div className="page-sub">승인된 식단 기반 식자재 발주서 자동 생성</div>
        </div>
      </div>

      <div className="card gap-14">
        <div className="card-title"><i className="ti ti-adjustments" /> 발주 설정</div>
        <div className="order-config">
          <div className="form-group">
            <label>식단 실행 ID</label>
            <input
              type="text"
              value={runId}
              onChange={(e) => setRunId(e.target.value)}
              placeholder="MENTOR 식단 설계에서 승인된 run_id"
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border2)" }}
            />
          </div>
          <div className="form-group">
            <label>발주 주차</label>
            <select value={weekOffset} onChange={(e) => setWeekOffset(Number(e.target.value))}>
              <option value={0}>1주차 (1~7일)</option>
              <option value={1}>2주차 (8~14일)</option>
              <option value={2}>3주차 (15~21일)</option>
              <option value={3}>4주차 (22~28일)</option>
            </select>
          </div>
        </div>
        <button className="btn btn-accent" onClick={handlePreview} disabled={loading}>
          <i className="ti ti-search" /> {loading ? "조회 중..." : "발주 미리보기"}
        </button>
      </div>

      {error && <ErrorState message={error} />}
      {loading && <LoadingState message="발주 항목을 계산하는 중..." />}

      {preview && preview.items.length === 0 && (
        <EmptyState message="해당 주차에 발주할 항목이 없습니다." />
      )}

      {preview && preview.items.length > 0 && (
        <div className="card gap-14">
          <div className="card-title"><i className="ti ti-table" /> 발주 미리보기 ({preview.week_range})</div>
          <div className="excel-wrap">
            <table className="excel-table">
              <thead>
                <tr>
                  <th>메뉴명</th><th>재료</th><th>사용 끼니수</th><th>총 중량(g)</th>
                  <th>구매 상품</th><th>단가</th><th>예상 비용</th>
                </tr>
              </thead>
              <tbody>
                {preview.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.menu_name}</td>
                    <td>{item.ingredient}</td>
                    <td>{item.servings_used}</td>
                    <td>{item.total_weight_g.toLocaleString()}</td>
                    <td>{item.product_name ?? "-"}</td>
                    <td>{item.unit_price ? `${item.unit_price.toLocaleString()}원` : "-"}</td>
                    <td style={{ fontWeight: 500 }}>
                      {item.estimated_cost ? `${item.estimated_cost.toLocaleString()}원` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="excel-total">
            <span>총 품목 수: <strong>{preview.total_items}개</strong></span>
            <span>총 발주 금액: <strong style={{ color: "var(--accent)" }}>{preview.total_cost.toLocaleString()}원</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}
