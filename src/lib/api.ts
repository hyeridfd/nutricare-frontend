// src/lib/api.ts
// FastAPI 백엔드 호출 래퍼. VITE_API_BASE_URL 환경변수로 백엔드 주소 설정.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json()
}

// ── 인증 ────────────────────────────────────────────────
export interface LoginResponse {
  token: string
  facility_id: string
  facility_name: string
}

export const authApi = {
  login: (loginId: string, password: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login_id: loginId, password }),
    }),
}

// ── 환자 ────────────────────────────────────────────────
export interface Patient {
  id: string
  name: string
  age: number
  disease_type_label: string
  meal_texture_rice: string
  meal_texture_side: string
}

export const patientsApi = {
  list: (facilityId: string) =>
    request<Patient[]>(`/api/patients?facility_id=${facilityId}`),
  get: (id: string) => request<Patient>(`/api/patients/${id}`),
  create: (payload: Record<string, unknown>) =>
    request("/api/patients", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: Record<string, unknown>) =>
    request(`/api/patients/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deactivate: (id: string) =>
    request(`/api/patients/${id}`, { method: "DELETE" }),
}

// ── 대시보드 ────────────────────────────────────────────
export interface DashboardSummary {
  total_patients: number
  nutrition_alert_count: number
  disease_type_distribution: Record<string, number>
}

export interface ResidentRow {
  id: string
  name: string
  age: number
  disease_type_label: string
  meal_texture: string
  alert_nutrients: string[]
  status: "정상" | "보강필요"
}

export interface NutrientSummary {
  facility_avg: number
  target: number
  pct_of_target: number
}
export interface PatientNutrientRow {
  patient_id: string
  patient_name: string
  avg_energy_kcal: number
  avg_protein_g: number
  avg_carb_g: number
  avg_sodium_mg: number
  energy_pct_of_target: number
  is_deficit: boolean
}
export interface NutritionIntakeResponse {
  by_nutrient: Record<string, NutrientSummary>
  by_patient: PatientNutrientRow[]
}

export const dashboardApi = {
  summary: (facilityId: string) =>
    request<DashboardSummary>(`/api/dashboard/summary?facility_id=${facilityId}`),
  residents: (facilityId: string) =>
    request<ResidentRow[]>(`/api/dashboard/residents?facility_id=${facilityId}`),
  mealWaste: (facilityId: string, days = 7) =>
    request<{ by_disease_type: Record<string, number>; by_meal: Record<string, number> }>(
      `/api/dashboard/meal-waste?facility_id=${facilityId}&days=${days}`
    ),
  alerts: (facilityId: string, status = "open") =>
    request(`/api/dashboard/nutrition-alerts?facility_id=${facilityId}&status=${status}`),
  nutritionIntake: (facilityId: string, days = 7) =>
    request<NutritionIntakeResponse>(
      `/api/dashboard/nutrition-intake?facility_id=${facilityId}&days=${days}`
    ),
}

// ── 식단 설계 (MENTOR) ─────────────────────────────────
export interface MealPlanRun {
  id: string
  status: "optimizing" | "pending_review" | "approving" | "approved" | "rejected"
  diseases_targeted: string[]
  diseases_excluded: string[]
  f1_violation: number | null
  reoptimize_count: number
  meal_plan_slots?: MealPlanSlot[]
  report_meal_plan_url: string | null
  report_serving_url: string | null
  report_cooking_url: string | null
}

export interface MealPlanSlot {
  day_number: number
  meal_type: "아침" | "점심" | "저녁"
  rice: string
  soup: string
  main_dish: string
  side_dish_1: string
  side_dish_2: string
  kimchi: string
  energy_kcal: number
  sodium_mg: number
  protein_g: number
  cost_won: number
  recommended_menu_summary: string
  recommended_menu_count: number
}

export const mealPlansApi = {
  run: (payload: {
    facility_id: string
    diseases: string[]
    budget_per_meal?: number
    auto_approve?: boolean
  }) =>
    request<{ run_id: string; status: string }>("/api/meal-plans/run", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getStatus: (runId: string) => request<MealPlanRun>(`/api/meal-plans/${runId}`),
  approve: (runId: string) =>
    request(`/api/meal-plans/${runId}/approve`, { method: "POST" }),
  reject: (runId: string) =>
    request(`/api/meal-plans/${runId}/reject`, { method: "POST" }),
  personalizedSwaps: (runId: string, patientId?: string) =>
    request(
      `/api/meal-plans/${runId}/personalized-swaps${patientId ? `?patient_id=${patientId}` : ""}`
    ),
  servings: (runId: string, patientId?: string) =>
    request(`/api/meal-plans/${runId}/servings${patientId ? `?patient_id=${patientId}` : ""}`),
}

// ── 잔반 ────────────────────────────────────────────────
export const wasteApi = {
  create: (payload: Record<string, unknown>) =>
    request("/api/waste-logs", { method: "POST", body: JSON.stringify(payload) }),
  list: (patientId: string, limit = 30) =>
    request(`/api/waste-logs?patient_id=${patientId}&limit=${limit}`),
  runPreferenceUpdate: (facilityId: string) =>
    request(`/api/waste-logs/run-preference-update?facility_id=${facilityId}`, {
      method: "POST",
    }),
}

// ── 발주 ────────────────────────────────────────────────
export const ordersApi = {
  preview: (runId: string, weekOffset = 0) =>
    request(`/api/orders/preview?run_id=${runId}&week_offset=${weekOffset}`),
}

// ── 선호도 ──────────────────────────────────────────────
export interface PreferenceItem {
  menu_name: string
  score: number
  updated_at: string
}
export interface FacilityPreferenceResponse {
  items: PreferenceItem[]
  dislike_count: number
  like_count: number
}
export interface PatientPreferenceSummary {
  patient_id: string
  patient_name: string
  total_menus: number
  dislike_count: number
  like_count: number
}
export interface PatientPreferenceDetail {
  patient_name: string | null
  items: PreferenceItem[]
  dislike_count: number
  like_count: number
}

export const preferencesApi = {
  facility: (facilityId: string, limit = 50) =>
    request<FacilityPreferenceResponse>(
      `/api/preferences/facility?facility_id=${facilityId}&limit=${limit}`
    ),
  patientsList: (facilityId: string) =>
    request<{ patients: PatientPreferenceSummary[] }>(
      `/api/preferences/patients?facility_id=${facilityId}`
    ),
  patientDetail: (facilityId: string, patientId: string) =>
    request<PatientPreferenceDetail>(
      `/api/preferences/patients?facility_id=${facilityId}&patient_id=${patientId}`
    ),
}