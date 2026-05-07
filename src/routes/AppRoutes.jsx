import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import MembersPage from "../pages/MembersPage";
import MemberDetailPage from "../pages/MemberDetailPage";
import CreateMemberPage from "../pages/CreateMemberPage";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../components/layouts/AppLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/members" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/new" element={<CreateMemberPage />} />
        <Route
          path="/members/:mitgliedsnummer"
          element={<MemberDetailPage />}
        />
      </Route>
    </Routes>
  );
}
