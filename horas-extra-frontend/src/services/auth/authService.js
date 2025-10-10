import { authAxios } from "@/api/axiosInstance";

export const authService = {
  login: async (userData) => {
    try {
      const response = await authAxios.post("/auth/login", userData);
      console.log(response.data.msg);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Error desconocido al iniciar sesión";
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      const response = await authAxios.post("/auth/logout");
      console.log(response.data.msg);      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Error desconocido al cerrar sesión";
      throw new Error(errorMessage);
    }
  },

  renew: async () => {
    try {
      const response = await authAxios.post("/auth/renew");
      console.log(response.data);
      return response.data; // aquí viene el nuevo accessToken
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Error al renovar el token";
      throw new Error(errorMessage);
    }
  },
};
