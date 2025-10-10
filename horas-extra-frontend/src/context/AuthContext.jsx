import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services";
import { axiosInstance, setupInterceptors } from "@/api/axiosInstance";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  setToken: () => {},
});

// Función para revisar si el accessToken está expirado
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000; // convertir exp a ms
  } catch (err) {
    return true; // si no se puede decodificar, consideramos expirado
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!(token && user));
  const [isLoading, setIsLoading] = useState(true);

  // Función que actualiza token en estado, axios y localStorage
  const setTokenAndAxios = (newToken) => {
    setToken(newToken);
    localStorage.setItem("accessToken", newToken);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  // Configuración inicial del contexto y axios
  useEffect(() => {
    // Configuramos axios con el token inicial de localStorage
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Conectamos interceptores con la función que actualiza el token
    setupInterceptors(setTokenAndAxios, logout);

    // Refresh preventivo solo si el token ha expirado
    const initAuth = async () => {
      if (!token) return setIsLoading(false);

      if (isTokenExpired(token)) {
        try {
          const data = await authService.renew();
          setTokenAndAxios(data.token);
        } catch (err) {
          logout();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (accessToken, userData) => {
    try {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userData", JSON.stringify(userData));
      setTokenAndAxios(accessToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error al guardar datos de autenticación", error);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      axiosInstance.defaults.headers.common["Authorization"] = "";
    }
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      isLoading,
      login,
      logout,
      setToken: setTokenAndAxios,
    }),
    [isAuthenticated, user, token, isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);