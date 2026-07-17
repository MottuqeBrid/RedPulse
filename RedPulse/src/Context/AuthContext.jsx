import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axiosInstance from "../lib/axiosInstance";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const fetchUser = async () => {
  const { data } = await axiosInstance.get("user/me");
  return data.user;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
        try {
          const userData = await fetchUser();
          setUser({ ...userData });
        } catch {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          delete axiosInstance.defaults.headers.common.Authorization;
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = useCallback(async (token, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    const userData = await fetchUser();
    setUser({ ...userData });
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("user/logout", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
        },
      });
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      delete axiosInstance.defaults.headers.common.Authorization;
    } catch (error) {
      console.error("Error occurred while logging out:", error);
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, login, logout, loading, isAuthenticated: !!user }),
    [user, login, logout, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
