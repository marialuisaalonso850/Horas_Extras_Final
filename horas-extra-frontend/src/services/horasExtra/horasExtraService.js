import { axiosInstance } from "../../api/axiosInstance"

export const horasExtraService = {

  // es la mejor practica en proyectos grandes (throw new error) en proyectos
  // pequeños se podria devolver siempre un objeto {ok: true o false, msg:''}
  crearExtras: async (extrasData) => {
    try {
      const res = await axiosInstance.post("/extras/crear", extrasData);
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error creando horas extra ❌'
      throw new Error(errorMessage);
    }
  },


  listarExtras: async (page = 1, limit = 15) => { 
    try {
      const params = new URLSearchParams({
        page: page,
        limit: limit,
      });
      
      const res = await axiosInstance.get(`/extras/listar?${params.toString()}`);
      return res.data;
    } catch (error) {
      console.error("Error listando horas extra:", error);
      throw error.response?.data || error.message;
    }
  },

  eliminarExtras: async (id) => {
    try {
      const res = await axiosInstance.delete(`/extras/delete/${id}`);
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error eliminando horas extra ❌';
      throw new Error(errorMessage);
    }
  },

  actualizarExtras: async(id, data) => {
    try {
      const res = await axiosInstance.put(`/extras/update/${id}`, data);
      return res.data;
    } catch (error) {
      console.error('Error actualizando horas extra', error);
      throw error.response?.data || error.message;      
    }
  },


  listarExtrasPorFuncionario: async (identificacion) => {
    try {
      const res = await axiosInstance.get(`/extras/funcionario/${identificacion}`);
      return res.data;
    } catch (error) {
      console.error(`Error obteniendo horas extra del funcionario con identificacion ${identificacion}`, error);
      throw error.response?.data || error.message;
    }
  },

  listarExtrasPorFechas: async (fechaInicio, fechaFin) => {
    try {
      const res = await axiosInstance.get(`/extras/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
      return res.data;
    } catch (error) {
      console.error(`Error obteniendo horas extra ${fechaInicio}, ${fechaFin}`, error);
      throw error.response?.data || error.message;
    }
  },

  // exportarExcel

  // Importar Extras
  importarExtras: async (formData) => {
    try {
      const res = await axiosInstance.post('/extras/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      const backendMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error importando horas extra ❌';

      throw new Error(backendMsg);
    }
  },


  obtenerNombreHojasExcel: async (formData) => {
    try {
      const res = await axiosInstance.post('/extras/sheets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error obteniendo hojas de excel ❌'
      throw new Error(errorMessage);
    }
  },
};
