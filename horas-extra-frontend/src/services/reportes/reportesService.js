import { axiosInstance } from '@/api/axiosInstance';

export const reportesService = {
  crearReporte: async (reporteData) => {
    try {
      const res = await axiosInstance.post('/reporte/crear', reporteData);
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.mensaje || 'Error desconocido al crear reporte';
      console.error(errorMessage);
    }
  },

exportarReporteExcel: async (reporteData) => {
  try {
    const res = await axiosInstance.post('/reporte/exportar', reporteData, {
      responseType: 'blob',
    });
    return res;
  } catch (error) {
    const errorMessage =
      error.res?.data?.mensaje || 'Error desconocido al crear reporte';
    console.error(errorMessage);
    throw error;
  }
},


  listarReportes: async() => {
    try {
      const res = await axiosInstance.get('/reporte/listar');
      console.log('Ok listando reportes de Excel');
      return res.data
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Error desconocido al crear reporte';
      console.error(errorMessage);
    }
  }
};
