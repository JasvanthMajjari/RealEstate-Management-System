import api from "../utils/axios.js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext.jsx";
import API_URL from "../config.js";
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null,
  );

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Logout moved up

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  // Load the user
  useEffect(() => {
    if (token) {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        setTimeout(() => {
          setUser(JSON.parse(storedUser));
        }, 0);
      }
    }

    setTimeout(() => {
      setLoading(false);
    }, 0);

    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data.message?.includes("blocked")
        ) {
          logout();
        }
        return Promise.reject(error);
      },
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [token, logout]);

  //Login

  const login = async (email, password) => {
    try {
      const res = await api.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login Denied or Failed..",
      };
    }
  };

  //register

  const register = async (userData) => {
    try {
      const res = await api.post(`${API_URL}/api/auth/register`, userData);
      return {
        success: true,
        message: res.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration Failed..",
      };
    }
  };

  //to get the user details or refresh the user
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        const storage = localStorage.getItem("token")
          ? localStorage
          : sessionStorage;

        storage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to refresh the user : ", error);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
