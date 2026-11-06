import HomePage from "@/page/Home/HomePage";
import { Navigate, Route, Routes } from "react-router-dom";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<HomePage/>}/>
      
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default AppRoutes