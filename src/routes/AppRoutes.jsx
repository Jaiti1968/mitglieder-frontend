import { Navigate, Route, Routes } from "react-router-dom";
import MembersPage from "../pages/MembersPage";
import MemberDetailPage from "../pages/MemberDetailPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/members" replace />} />
      <Route path="/members" element={<MembersPage />} />
      <Route path="/members/:mitgliedsnummer" element={<MemberDetailPage />} />
    </Routes>
  );
}