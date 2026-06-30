import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import ResidentStatus from "./pages/ResidentStatus"
import MealWaste from "./pages/MealWaste"
import NutritionIntake from "./pages/NutritionIntake"
import MentorDesign from "./pages/MentorDesign"
import OrderExcel from "./pages/OrderExcel"
import "./dashboard.css"

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<ResidentStatus />} />
            <Route path="/meal-waste" element={<MealWaste />} />
            <Route path="/nutrition" element={<NutritionIntake />} />
            <Route path="/design" element={<MentorDesign />} />
            <Route path="/orders" element={<OrderExcel />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
