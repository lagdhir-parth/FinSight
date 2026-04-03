import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./features/auth/AuthContext";
import { ProtectedRoute, GuestRoute } from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RecordsPage from "./pages/RecordsPage";
import MyRecordsPage from "./pages/MyRecordsPage";
import UsersPage from "./pages/UsersPage";
import ProfilePage from "./pages/ProfilePage";
import DeletedRecordsPage from "./pages/DeletedRecordsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-light)",
                fontFamily: "DM Sans",
                fontSize: 13,
              },
              success: {
                iconTheme: { primary: "#22d3a0", secondary: "transparent" },
              },
              error: {
                iconTheme: { primary: "#f97052", secondary: "transparent" },
              },
            }}
          />
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route
                path="/*"
                element={
                  <AppLayout>
                    <Routes>
                      <Route
                        index
                        element={<Navigate to="/dashboard" replace />}
                      />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="records" element={<RecordsPage />} />
                      <Route path="my-records" element={<MyRecordsPage />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route
                        path="deleted-records"
                        element={<DeletedRecordsPage />}
                      />
                    </Routes>
                  </AppLayout>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
