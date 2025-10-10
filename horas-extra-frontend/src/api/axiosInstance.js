import { authService } from "@/services";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 👉 Segunda instancia solo para auth
export const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // importante para que mande el refreshToken en cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// 👉 Configuración de interceptores
export const setupInterceptors = (setToken, logout) => {
  axiosInstance.interceptors.response.use(
    (response) => response, // deja pasar respuestas normales
    async (error) => {
      const originalRequest = error.config;

      // 👉 Ignorar si el error viene del renew
      if (originalRequest.url.includes("/auth/renew")) {
        return Promise.reject(error);
      }

      // 🔐 Si el accessToken expiró (401) y no hemos reintentado aún
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          
          // pedir nuevo accessToken con el refreshToken (que está en cookie)
          const { token: newAccessToken } = await authService.renew();

          // actualizar AuthContext
          setToken(newAccessToken);

          // actualizar axios headers (para siguientes requests)
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // reintenta la request original
          return axiosInstance(originalRequest);
        } catch (err) {
          
          console.error("Error al renovar el token", err);

          // si falla el refresh → forzar logout
          logout();
        }
      }

      return Promise.reject(error);
    }
  );
};
