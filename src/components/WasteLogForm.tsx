import { useEffect, useState, FormEvent } from "react"
import { patientsApi, wasteApi, Patient } from "../lib/api"
import { useAuth } from "../lib/auth"

const SLOTS = [
  { key: "rice_waste_rate", label: "밥" },
  { key: "soup_waste_rate", label: "국" },
  { key: "main_dish_waste_rate", label: "주찬" },
  { key: "side_dish_1_waste_rate", label: "부찬1" },
  { key: "side_dish_2_waste_rate", label: "부찬2" },
  { key: "kimchi_waste_rate", label: "김치" },
] as const

export default function WasteLogForm({ onSaved }: { onSaved?: () => void }) {
  const { facilityId } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState("")
  const [dayNumber, setDayNumber] = useState(1)
  const [mealType, setMealType] = useState<"아침" | "점심" | "저녁">("아침")
  const [rates, setRates] = useState<Record<string, number>>(
    Object.fromEntries(SLOTS.map((s) => [s.key, 0]))
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!facilityId) return
    patientsApi.list(facilityId).then(setPatients).catch(() => {})
  }, [facilityId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!patientId) {
      setMessage("어르신을 선택해 주세요.")
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await wasteApi.create({
        patient_id: patientId,
        day_number: dayNumber,
        meal_type: mealType,
        ...rates,
      })
      setMessage("저장되었습니다.")
      onSaved?.()
    } catch (e) {
      setMessage(`저장 실패: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card gap-14">
      <div className="card-title">
        <i className="ti ti-square-plus" /> 잔반 입력 (수동 — 추후 누비랩 스캐너 자동 연동 예정)
      </div>

      <div className="order-config">
        <div className="form-group">
          <label>어르신</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">선택하세요</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>일차</label>
          <input
            type="number" min={1} max={28} value={dayNumber}
            onChange={(e) => setDayNumber(Number(e.target.value))}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border2)" }}
          />
        </div>
        <div className="form-group">
          <label>끼니</label>
          <select value={mealType} onChange={(e) => setMealType(e.target.value as typeof mealType)}>
            <option value="아침">아침</option>
            <option value="점심">점심</option>
            <option value="저녁">저녁</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {SLOTS.map((s) => (
          <div key={s.key} className="form-group">
            <label>{s.label} 잔반율 ({Math.round(rates[s.key] * 100)}%)</label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={rates[s.key]}
              onChange={(e) => setRates((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))}
            />
          </div>
        ))}
      </div>

      {message && (
        <div style={{ fontSize: 12.5, color: message.startsWith("저장 실패") ? "var(--red)" : "var(--green)" }}>
          {message}
        </div>
      )}

      <button type="submit" className="btn btn-accent" disabled={saving} style={{ alignSelf: "flex-start" }}>
        <i className="ti ti-device-floppy" /> {saving ? "저장 중..." : "잔반 기록 저장"}
      </button>
    </form>
  )
}
