import { useState, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "../lib/api"
import { useAuth } from "../lib/auth"

export default function Login() {
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await authApi.login(loginId.trim(), password)
      login(res.token, res.facility_id, res.facility_name)
      navigate("/")
    } catch {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-badge">
            <i className="ti ti-heart-rate-monitor" />
          </div>
          <div className="login-title">NutriCare</div>
          <div className="login-subtitle">요양원 식사·영양 관리 시스템</div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-field">
            <span>요양원 아이디</span>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              required
            />
          </label>

          <label className="login-field">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="login-error">
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="login-footer">
          계정이 없으신가요? 관리자에게 문의해 가입을 요청해 주세요.
        </div>
      </div>
    </div>
  )
}
