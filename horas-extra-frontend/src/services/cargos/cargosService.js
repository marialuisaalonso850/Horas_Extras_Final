import { axiosInstance } from '@/api/axiosInstance';

export const cargosService = {
  crearCargo: async(data) => {
    try {
      const response = await axiosInstance.post('/cargos/crearCargo', data);
      console.log(response.data);
      return {
        ok: true,
        message: 'se creó el cargo de manera exitosa',
        cargo: response.data,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error desconocido creando cargo';
      return {
        ok: false,
        message: errorMessage,
      };
    }
  },

  listarCargos: async() => {
    try {
      const response = await axiosInstance.get('/cargos/listar');
      console.log(response.data);
      return response.data      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido listando los cargos'
      return errorMessage      
    }
  }
};