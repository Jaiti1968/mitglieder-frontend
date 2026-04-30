import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import MembersPage from "../pages/MembersPage";
import MemberDetailPage from "../pages/MemberDetailPage";
import CreateMemberPage from "../pages/CreateMemberPage";
import ProtectedRoute from "../auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/members" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <MembersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/members/new"
        element={
          <ProtectedRoute>
            <CreateMemberPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/members/:mitgliedsnummer"
        element={
          <ProtectedRoute>
            <MemberDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}