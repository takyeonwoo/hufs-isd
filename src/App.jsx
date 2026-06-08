import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import MapPage from "./pages/Map.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Apply from "./pages/Apply.jsx";
import ApplyComplete from "./pages/ApplyComplete.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminApplications from "./pages/AdminApplications.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/apply" element={<Apply />} />
      <Route path="/apply/complete" element={<ApplyComplete />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminApplications />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
