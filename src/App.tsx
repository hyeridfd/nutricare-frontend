import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import RequireAuth from "./components/RequireAuth"
import { AuthProvider } from "./lib/auth"
import Login from "./pages/Login"
import ResidentStatus from "./pages/ResidentStatus"
import MealWaste from "./pages/MealWaste"
import NutritionIntake from "./pages/NutritionIntake"
import MentorDesign from "./pages/MentorDesign"
import Preferences from "./pages/Preferences"
import OrderExcel from "./pages/OrderExcel"
import "./dashboard.css"

function DashboardLayout({ children }: { children: JSX.Element }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<ResidentStatus />} />
                    <Route path="/meal-waste" element={<MealWaste />} />
                    <Route path="/nutrition" element={<NutritionIntake />} />
                    <Route path="/design" element={<MentorDesign />} />
                    <Route path="/preferences" element={<Preferences />} />
                    <Route path="/orders" element={<OrderExcel />} />
                  </Routes>
                </DashboardLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

