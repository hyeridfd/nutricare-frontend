import { useState } from "react"
import { authApi } from "../lib/api"
import { useAuth } from "../lib/auth"

export default function AccountSettings() {
  const { facilityId } = useAuth()
  const FACILITY_ID = facilityId || ""

  const [currentPassword, setCurrentPassword] = useState("")
  const [newLoginId, setNewLoginId] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!currentPassword.trim()) {
      setError("현재 비밀번호를 입력해 주세요.")
      return
    }
    if (!newLoginId.trim() && !newPassword.trim()) {
      setError("변경할 아이디 또는 새 비밀번호 중 하나는 입력해 주세요.")
      return
    }
    if (newPassword && newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.")
      return
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError("새 비밀번호가 서로 일치하지 않습니다.")
      return
    }

    setSubmitting(true)
    try {
      const res = await authApi.updateCredentials({
        facility_id: FACILITY_ID,
        current_password: currentPassword,
        new_login_id: newLoginId.trim() || undefined,
        new_password: newPassword.trim() || undefined,
      })
      setSuccess(`${res.message} (아이디: ${res.login_id})`)
      setCurrentPassword("")
      setNewLoginId("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">계정 설정</div>
          <div className="page-sub">로그인 아이디·비밀번호 변경</div>
        </div>
      </div>

      <div className="card gap-14" style={{ maxWidth: 420 }}>
        <div className="card-title"><i className="ti ti-lock" /> 아이디/비밀번호 변경</div>

        <div className="form-group">
          <label>현재 비밀번호 (필수)</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="본인 확인을 위해 입력해 주세요"
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border2)", width: "100%" }}
          />
        </div>

        <div className="form-group">
          <label>새 아이디 (변경 시에만 입력)</label>
          <input
            type="text"
            value={newLoginId}
            onChange={(e) => setNewLoginId(e.target.value)}
            placeholder="변경하지 않으려면 비워두세요"
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border2)", width: "100%" }}
          />
        </div>

        <div className="form-group">
          <label>새 비밀번호 (변경 시에만 입력, 8자 이상)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="변경하지 않으려면 비워두세요"
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border2)", width: "100%" }}
          />
        </div>

        {newPassword && (
          <div className="form-group">
            <label>새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호를 한 번 더 입력해 주세요"
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border2)", width: "100%" }}
            />
          </div>
        )}

        {error && <div style={{ color: "var(--danger, #d33)", fontSize: 12.5 }}>{error}</div>}
        {success && <div style={{ color: "var(--accent)", fontSize: 12.5 }}>{success}</div>}

        <button className="btn btn-accent" onClick={handleSubmit} disabled={submitting}>
          <i className="ti ti-device-floppy" /> {submitting ? "저장 중..." : "변경 사항 저장"}
        </button>
      </div>
    </div>
  )
}
