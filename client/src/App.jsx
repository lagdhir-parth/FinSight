import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./features/auth/AuthContext";
import { ProtectedRoute, GuestRoute } from "./routes/ProtectedRoute";

const AppLayout = lazy(() => import("./components/layout/AppLayout"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const RecordsPage = lazy(() => import("./pages/RecordsPage"));
const MyRecordsPage = lazy(() => import("./pages/MyRecordsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DeletedRecordsPage = lazy(() => import("./pages/DeletedRecordsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false },
  },
});

function RouteLoader() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{
            borderColor: "var(--border)",
            borderTopColor: "var(--accent)",
          }}
        />
        <span
          style={{
            color: "var(--text-muted)",
            fontFamily: "Syne",
            fontSize: 13,
          }}
        >
          Loading page...
        </span>
      </div>
    </div>
  );
}

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
          <Suspense fallback={<RouteLoader />}>
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
