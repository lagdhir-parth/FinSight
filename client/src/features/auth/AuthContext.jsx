import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.data.data);
    return res.data;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    return res.data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isAnalyst = user?.role === "analyst";
  const isViewer = user?.role === "viewer";
  const canCreate = isAdmin || isAnalyst;
  const canAdminUpdate = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        isAnalyst,
        isViewer,
        canCreate,
        canAdminUpdate,
        refetchUser: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
