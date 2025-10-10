import { axiosInstance } from '../../api/axiosInstance';

export const funcionariosService = {
  listarFuncionarios: async () => {
    try {
      const res = await axiosInstance.get('/funcionario');
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Error desconocido al obtener funcionarios';
      return {
        ok: false,
        message: `Error obteniendo todos los funcionarios. ${errorMessage}`,
      };
    }
  },

  crearFuncionarios: async (funcionarioData) => {
    try {
      const res = await axiosInstance.post(
        '/funcionario/crearfuncionario',
        funcionarioData
      );
      console.log('Registro de funcionario exitoso');
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Error desconocido al crear funcionario';
      return {
        ok: false,
        message: `Error creando el funcionario. ${errorMessage}`,
      };
    }
  },

  actualizarFuncionario: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/funcionario/actualizar/${id}`, data);
      return {
        success: res.data?.success ?? true,
        message: res.data?.message ?? 'Funcionario actualizado exitosamente',
        data: res.data?.data ?? null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error desconocido actualizando el funcionario',
        data: null,
      };
    }
  },
  listarFuncionarioPorId: async (id) => {
    try {
      const res = await axiosInstance.get(`/funcionario/obtener/${id}`);
      console.log(res.data);
      return res.data;      
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Error desconocido al obtener funcionario';
      return {
        ok: false,
        message: `Error obteniendo el funcionario con id:${id}. ${errorMessage}`,
      };
    }
  },

  listarFuncionariosActivos: async () => {
    try {
      const res = await axiosInstance.get('/funcionario/activos');
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Error desconocido al obtener funcionarios activos';
      return {
        ok: false,
        message: `Error obteniendo todos los funcionarios activos. ${errorMessage}`,
      };
    }
  },

};
