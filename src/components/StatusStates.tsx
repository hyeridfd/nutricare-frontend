// 공통 상태 컴포넌트 — 로딩/빈 상태/에러를 일관되게 표시
// 데이터 신뢰가 중요한 운영 도구이므로, "아직 안 불러왔는지" vs
// "정말 데이터가 없는지" vs "실패했는지"를 항상 구분해서 보여줌.

export function LoadingState({ message = "불러오는 중..." }: { message?: string }) {
  return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text3)" }}>
      <i className="ti ti-loader-2" style={{ fontSize: 24, animation: "spin 1s linear infinite" }} />
      <div style={{ marginTop: 8, fontSize: 13 }}>{message}</div>
    </div>
  )
}

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text3)" }}>
      <i className="ti ti-inbox" style={{ fontSize: 28 }} />
      <div style={{ marginTop: 8, fontSize: 13 }}>{message}</div>
      {hint && <div style={{ marginTop: 4, fontSize: 11 }}>{hint}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="alert-item danger" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <i className="ti ti-x-circle" />
        <div>{message}</div>
      </div>
      {onRetry && (
        <button className="btn" onClick={onRetry} style={{ marginLeft: 26 }}>
          <i className="ti ti-refresh" /> 다시 시도
        </button>
      )}
    </div>
  )
}
