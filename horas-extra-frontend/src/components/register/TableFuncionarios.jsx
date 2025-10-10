import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { funcionariosService } from '@/services';
import { cargosService } from '@/services/cargos/cargosService';
import {   Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const TableFuncionarios = ({ onBack }) => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [funcionarioSeleccionado, setFuncionarioSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalAlertas, setModalAlertas] =useState(false);
  const [estado, setEstado] = useState('');
  const [mensaje, setMensaje] = useState('');


  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  // ✅ cargar todos los funcionarios al montar
  useEffect(() => {
    getFuncionarios();
    getCargos();
  }, []);

  const getFuncionarios = async () => {
    try {
      const response = await funcionariosService.listarFuncionarios();
      setFuncionarios(response.data);
    } catch (error) {
      console.error('Error cargando funcionarios', error);
    }
  };

  const getCargos = async () => {
    try {
      const res = await cargosService.listarCargos();
      setCargos(res.data);
    } catch (error) {
      console.error('Error lostando cargos', error);
    }
  };

  const loadFuncionariosActivos = async () => {
    try {
      const response = await funcionariosService.listarFuncionariosActivos();
      setFuncionarios(response.data.filter((f) => f.estado === 'Activo'));
    } catch (error) {
      console.error('Error filtrando funcionarios activos', error);
    }
  };

  const getFuncionarioById = async (id) => {
    if (!id) return;
    try {
      const response = await funcionariosService.listarFuncionarioPorId(id);
      setFuncionarios(response.data ? [response.data] : []);
    } catch (error) {
      console.error('Error buscando funcionario', error);
      setFuncionarios([]);
    }
  };

  const abrirFormulario = (funcionario) => {
    setFuncionarioSeleccionado(funcionario);
    reset({
      ...funcionario,
      Cargo: funcionario.Cargo?._id || '',
    }); // ✅ resetea el formulario con los datos del funcionario
    setMostrarModal(true);
  };

  // TODO: cuadrar el onSubmit
  const onSubmit = async (data) => {
    const response = await funcionariosService.actualizarFuncionario(
      funcionarioSeleccionado._id,
      data
    );

    if(response.success) {
      setEstado('Actualización Exitosa');
      setMostrarModal(false);
      getFuncionarios();
    } else {
      setEstado('Error');
    }

    setMensaje(response.message);
    setModalAlertas(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="bg-epaColor text-white p-2 w-30 rounded-4xl border-2 border-transparent hover:bg-transparent hover:text-epaColor hover:border-epaColor hover:font-semibold hover:scale-105 transform transition duration-300 ease-in-out"
      >
        Regresar
      </button>

      {/* Botones e input */}
      <div className="bg-white w-1/2 p-4 rounded-2xl flex flex-row items-center justify-center gap-4 mb-4 mx-auto">
        <button
          onClick={getFuncionarios}
          className="bg-gray-200 px-4 py-2 rounded-md cursor-pointer"
        >
          Todos
        </button>
        <button
          onClick={loadFuncionariosActivos}
          className="bg-green-200 px-4 py-2 rounded-md cursor-pointer"
        >
          Activos
        </button>
        <input
          type="text"
          placeholder="Buscar por ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && getFuncionarioById(searchId)}
          className="border px-2 py-1 rounded-md"
        />
        <button
          onClick={() => getFuncionarioById(searchId)}
          className="bg-[#002d72] hover:bg-blue-700 text-white px-3 py-2 rounded-lg cursor-pointer"
        >
          🔍
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-md rounded-lg w-[400px] p-6 lg:w-[1200px] mx-auto">
        <table className="w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-epaColor h-8 text-left text-sm font-semibold text-white uppercase">
            <tr>
              <th className="py-4">Identificación</th>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Tipo de Operario</th>
              <th>Estado</th>
              <th>Actualizar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {funcionarios.map((func) => (
              <tr key={func._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2">{func.identificacion}</td>
                <td>{func.nombre_completo}</td>
                <td>{func.Cargo?.name ?? 'Sin cargo asignado'}</td>
                <td>{func.tipoOperario}</td>
                <td>{func.estado}</td>
                <td>
                  <button
                    onClick={() => abrirFormulario(func)}
                    className="block mx-auto cursor-pointer"
                  >
                    🔄
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {funcionarios.length === 0 && (
          <div className="text-center text-xl text-gray-500 font-semibold py-8">
            No se encontraron funcionarios
          </div>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && funcionarioSeleccionado && (
        <div className="fixed inset-0 bg-epaColor/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <h3 className="text-epaColor text-2xl font-extrabold pb-4">
              Editar Funcionario
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Identificacion */}
              <label className="block">
                <span className="text-epaColor font-semibold text-lg">
                  Identificación
                </span>
                <input
                  type="text"
                  className="border p-2 w-full rounded-md"
                  {...register('identificacion', {
                    required: 'Debe ingresar la identificación del funcionario',
                  })}
                />
              </label>
              {errors.identificacion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.identificacion.message}
                </p>
              )}

              {/* Nombre Completo */}
              <label className="block">
                <span className="text-epaColor font-semibold text-lg">
                  Nombre Completo
                </span>
                <input
                  type="text"
                  className="border p-2 w-full rounded-md"
                  {...register('nombre_completo', {
                    required: 'Debe ingresar el nombre del usuario',
                  })}
                />
              </label>
              {errors.nombre_completo && (
                <p className="text-red-500 text-sm">
                  {errors.nombre_completo.message}
                </p>
              )}

              {/* Cargo */}
              <label className="block">
                <span className="text-epaColor font-semibold text-lg">
                  Cargo
                </span>
                <Controller
                  name="Cargo"
                  control={control}
                  rules={{ required: 'Debe seleccionar el cargo' }}
                  render={({ field }) => (
                    <select {...field} className="border p-2 w-full rounded-md">
                      {cargos.map((cargo) => (
                        <option key={cargo._id} value={cargo._id}>
                          {cargo.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </label>
              {errors.Cargo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.Cargo.message}
                </p>
              )}

              {/* Tipo Operario */}
              <label className="block">
                <span className="text-epaColor font-semibold text-lg">
                  Tipo de Operario
                </span>
                <Controller
                  name="tipoOperario"
                  control={control}
                  rules={{ required: 'Debe seleccionar el tipo de operario' }}
                  render={({ field }) => (
                    <select {...field} className="border p-2 w-full rounded-md">
                      <option value="Planta">Planta</option>
                      <option value="Temporal">Temporal</option>
                    </select>
                  )}
                />
              </label>
              {errors.tipoOperario && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tipoOperario.message}
                </p>
              )}

              {/* Estado */}
              <label className="block">
                <span className="text-epaColor font-semibold text-lg">
                  Estado
                </span>
                <Controller
                  name="estado"
                  control={control}
                  rules={{ required: 'Debe seleccionar el estado' }}
                  render={({ field }) => (
                    <select {...field} className="border p-2 w-full rounded-md">
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  )}
                />
              </label>
              {errors.estado && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.estado.message}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Dialog open={modalAlertas} onOpenChange={setModalAlertas}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle
                className={`text-4xl text-center font-semibold mb-2 ${estado === "Error" ? "text-red-500" : "text-epaColor"}`}
              >
                {estado}
              </DialogTitle>
              <DialogDescription className={'text-xl text-center font-semibold mb-2'}>{mensaje}</DialogDescription>
            </DialogHeader>
            <button
              onClick={() => setModalAlertas(false)}
              className="bg-epaColor w-1/2 text-white rounded-xl p-1.5 border border-transparent mx-auto block hover:border-black hover:bg-blue-100 hover:text-epaColor hover:font-semibold"
            >Cerrar</button>
          </DialogContent>
        </Dialog>
    </>
  );
};
