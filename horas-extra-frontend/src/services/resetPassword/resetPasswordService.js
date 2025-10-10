import { axiosInstance } from "@/api/axiosInstance"

export const resetPasswordService = {
  solicitarReset: async(email) => {
    try {
      const response = await axiosInstance.post('/auth/solicitarReset', email);
      console.log('Ok solicitar reset', response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg
      console.error(errorMessage);      
    }
  },

  verificarCodigo: async(data) => {
    try {
      const response = await axiosInstance.post('/auth/verificarCodigo', data)
      console.log('Ok verificar codigo', response.data);      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg
      console.error(errorMessage);      
    }
  },

  resetPassword: async(data) => {
    try {
      const response = await axiosInstance.post('/auth/resetPassword', data)
      console.log('Ok reset password', response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg
      console.error(errorMessage);      
    }
  },
}