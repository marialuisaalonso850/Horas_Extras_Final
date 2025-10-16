import { useEffect, useState } from 'react';
import { horasExtraService } from '@/services';
import { LoadSpinner } from '../spinners/LoadSpinner';
import { useForm } from 'react-hook-form';
import {   Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
 } from '@/components/ui/dialog';

export const GetOvertime = ({ onBack }) => {
  const [horasExtra, setHorasExtra] = useState([]);
  const [filtroHorasExtra, setFiltroHorasExtra] = useState([]);
  const [busqueda, setBusqueda] = useState('')
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalUpdate, setMostrarModalUpdate] = useState(false);
  const [estado, setEstado] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 15;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getHorasExtra(currentPage); 
  }, [currentPage]);

  useEffect(() => {
  if (busqueda.trim() === '') {
    setFiltroHorasExtra(horasExtra);
  } else {
    const filtrado = horasExtra.filter((r) =>
      r.FuncionarioAsignado?.nombre_completo
        ?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      r.fecha_inicio_trabajo
        ?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      r.FuncionarioAsignado?.identificacion
        ?.toLowerCase().includes(busqueda.toLowerCase())
    );
    setFiltroHorasExtra(filtrado);
  }
}, [busqueda, horasExtra]);


  const getHorasExtra = async (page) => {
    setLoading(true);
    try {
      const response = await horasExtraService.listarExtras(page, limit);
      setHorasExtra(response.data);
      setFiltroHorasExtra(response.data);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalRecords(response.total);
    } catch (error) {
      console.error('Error cargando horas extra', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const abrirModal = (id) => {
    setIdSeleccionado(id);
    setMostrarModal(true);
  };

  const abrirModalUpdate = (id) => {
    setIdSeleccionado(id);

    const registro = horasExtra.find((r) => r._id === id);

    if (registro) {
      // Llenar los campos del formulario con los valores existentes
      reset({
        fecha_inicio_trabajo: registro.fecha_inicio_trabajo?.split('T')[0] || '',
        hora_inicio_trabajo: registro.hora_inicio_trabajo || '',
        fecha_fin_trabajo: registro.fecha_fin_trabajo?.split('T')[0] || '',
        hora_fin_trabajo: registro.hora_fin_trabajo || '',
        fecha_inicio_descanso: registro.fecha_inicio_descanso?.split('T')[0] || '',
        hora_inicio_descanso: registro.hora_inicio_descanso || '',
        fecha_fin_descanso: registro.fecha_fin_descanso?.split('T')[0] || '',
        hora_fin_descanso: registro.hora_fin_descanso || '',
        es_festivo_Inicio: registro.es_festivo_Inicio || false,
        es_festivo_Fin: registro.es_festivo_Fin || false,
      });
    }

    setMostrarModalUpdate(true);
  };

  const cerrarModal = () => {
    setIdSeleccionado(null);
    setMostrarModal(false);
    setMostrarModalUpdate(false);
  };

  const eliminarHorasExtra = async (id) => {
    try {
      const response = await horasExtraService.eliminarExtras(id);
      setHorasExtra(horasExtra.filter((r) => r._id !== id));
      setEstado(response.success ? "Respuesta Exitosa" : "Error");
      setMensaje(response.message);
    } catch (error) {
      setEstado("Error");
      setMensaje(error.message);
    } finally {
      setOpenModal(true);
      cerrarModal();
    }
  };

  const onSubmitUpdate = async (data) => {
    try {
      const response = await horasExtraService.actualizarExtras(idSeleccionado, data);
      setEstado(response.success ? "Respuesta Exitosa" : "Error");
      setMensaje(response.message);
      getHorasExtra();      
    } catch (error) {
      setEstado('Error');
      setMensaje(error);
    } finally {
      setOpenModal(true);
      cerrarModal();
    }
  };

  const formatDate = (value) => {
    return value ? new Date(value).toISOString().split('T')[0] : '—';
  };

  const formatHour = (value) => {
    return value && value.trim() !== '' ? value : '—';
  };

  // console.log(horasExtra);
  console.log(busqueda);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="bg-epaColor text-white p-2 w-30 rounded-4xl border-2 border-transparent hover:bg-transparent hover:text-epaColor hover:border-epaColor hover:font-semibold hover:scale-105 transform transition duration-300 ease-in-out"
      >
        Regresar
      </button>
      <h2 className="text-epaColor text-center text-4xl font-extrabold pt-2 pb-6">
        Registro Individual de Horas Extra
      </h2>
      <input
        type="text"
        placeholder='Buscar por identificación, nombre o fecha'
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className='w-sm bg-white text-epaColor p-1 border-2 border-epaColor rounded-md'


      />
      
      <div className="bg-white shadow-md rounded-lg p-6 mx-auto mt-6">
        <table className="w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-epaColor text-white">
            <tr>
              <th className="py-4 text-center border border-white">Identificación</th>
              <th className='text-center border border-white'>Nombre</th>
              <th className='text-center border border-white'>Fecha creación</th>
              <th className='text-center border border-white'>Inicio trabajo</th>
              <th className='text-center border border-white'>Fin trabajo</th>
              <th className='text-center border border-white'>
                Hora inicio
                <br />
                trabajo
              </th>
              <th className='text-center border border-white'>
                Hora fin
                <br />
                trabajo
              </th>
              <th className='text-center border border-white'>Inicio descanso</th>
              <th className='text-center border border-white'>Fin descanso</th>
              <th className='text-center border border-white'>
                Hora inicio
                <br />
                descanso
              </th>
              <th className='text-center border border-white'>
                Hora fin
                <br />
                descanso
              </th>
              <th className='text-center border border-white'>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {filtroHorasExtra.map((registro) => (
              <tr
                key={registro._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-2">
                  {registro.FuncionarioAsignado?.identificacion}
                </td>
                <td>{registro.FuncionarioAsignado?.nombre_completo}</td>
                <td>
                  {new Date(registro.createdAt).toISOString().split('T')[0]}
                </td>
                <td>
                  {
                    new Date(registro.fecha_inicio_trabajo)
                      .toISOString()
                      .split('T')[0]
                  }
                </td>
                <td>
                  {
                    new Date(registro.fecha_fin_trabajo)
                      .toISOString()
                      .split('T')[0]
                  }
                </td>
                <td>{registro.hora_inicio_trabajo}</td>
                <td>{registro.hora_fin_trabajo}</td>
                <td>{formatDate(registro.fecha_inicio_descanso)}</td>
                <td>{formatDate(registro.fecha_fin_descanso)}</td>
                <td>{formatHour(registro.hora_inicio_descanso)}</td>
                <td>{formatHour(registro.hora_fin_descanso)}</td>
                <td className="space-x-1 space-y-1">
                  <button
                    onClick={() => abrirModalUpdate(registro._id)}
                    className="bg-epaColor text-white px-3 py-1 rounded-lg hover:bg-gray-500 transition"
                  >
                    Actualizar
                  </button>
                  <button
                    onClick={() => abrirModal(registro._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-700">
            Mostrando {filtroHorasExtra.length} de {totalRecords} registros
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-epaColor text-white rounded disabled:bg-gray-400"
            >
              Anterior
            </button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-epaColor text-white rounded disabled:bg-gray-400"
            >
              Siguiente
            </button>
          </div>
        </div>
        {horasExtra.length === 0 && (
          <div className="text-center text-xl text-gray-500 font-semibold py-8">
            No se encontraron registros de horas extra
          </div>
        )}
      </div>
      {loading && <LoadSpinner styles="absolute bg-gray-200/95" />}
      {mostrarModalUpdate && (
        <div className="fixed inset-0 bg-epaColor/50 flex items-center justify-center">
          <form
            className="bg-white p-6 rounded-lg shadow-lg w-[1000px]"
            onSubmit={handleSubmit(onSubmitUpdate)}
          >
            <h3 className="text-epaColor text-2xl font-extrabold pb-4">
              Editar Horas Extra
            </h3>
            <div className="grid grid-cols-2 gap-6 pb-5">
              <div className="flex justify-between items-center">
                <label className="flex flex-col w-4/5">
                  <span className="text-epaColor font-semibold">
                    Fecha Inicio Trabajo
                  </span>
                  <input
                    type="date"
                    className="border border-gray-500 rounded-md p-1"
                    {...register('fecha_inicio_trabajo', {
                      required:
                        'La fecha de inicio de la jornada laboral es obligatoria',
                    })}
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-epaColor font-semibold">Festivo</span>
                  <input type="checkbox" {...register('es_festivo_Inicio')} />
                </label>
              </div>

              <label className="flex flex-col">
                <span className="text-epaColor font-semibold">
                  Hora Inicio Trabajo
                </span>
                <input
                  type="time"
                  className="border border-gray-500 rounded-md p-1"
                  {...register('hora_inicio_trabajo', {
                    required:
                      'La hora de inicio de la jornada laboral es obligatoria',
                  })}
                />
              </label>

              <div className="flex justify-between items-center">
                <label className="flex flex-col w-4/5">
                  <span className="text-epaColor font-semibold">
                    Fecha Fin Trabajo
                  </span>
                  <input
                    type="date"
                    className="border border-gray-500 rounded-md p-1"
                    {...register('fecha_fin_trabajo', {
                      required:
                        'La fecha de culminación de la jornada laboral es obligatoria',
                    })}
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-epaColor font-semibold">Festivo</span>
                  <input type="checkbox" {...register('es_festivo_Fin')} />
                </label>
              </div>

              <label className="flex flex-col">
                <span className="text-epaColor font-semibold">
                  Hora Fin Trabajo
                </span>
                <input
                  type="time"
                  className="border border-gray-500 rounded-md p-1"
                  {...register('hora_fin_trabajo', {
                    required:
                      'La hora de culminación de la jornada laboral es obligatoria',
                  })}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-epaColor font-semibold">
                  Fecha Inicio Descanso
                </span>
                <input
                  type="date"
                  className="border border-gray-500 rounded-md p-1"
                  {...register('fecha_inicio_descanso')}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-epaColor font-semibold">
                  Hora Inicio Descanso
                </span>
                <input
                  type="time"
                  className="border border-gray-500 rounded-md p-1"
                  {...register('hora_inicio_descanso')}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-epaColor font-semibold">
                  Fecha Fin Descanso
                </span>
                <input
                  type="date"
                  className="border border-gray-500 rounded-md p-1"
                  {...register('fecha_fin_descanso')}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-epaColor font-semibold">
                  Hora Fin Descanso
                </span>
                <input
                  type="time"
                  className="border border-gray-500 rounded-md p-1"
                  {...register('hora_fin_descanso')}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md w-30"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={cerrarModal}
                className="bg-gray-400 text-white px-4 py-2 rounded-md w-30"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      {mostrarModal && (
        <div className="fixed inset-0 bg-epaColor/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 rounded-lg bg-epaColor text-white hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarHorasExtra(idSeleccionado)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
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
            onClick={() => setOpenModal(false)}
            className="bg-epaColor w-1/2 text-white rounded-xl p-1.5 border border-transparent mx-auto block hover:border-black hover:bg-blue-100 hover:text-epaColor hover:font-semibold"
          >Cerrar</button>
        </DialogContent>
      </Dialog>
    </>
  );
};



/* 
  fecha_inicio_trabajo: '2025-09-22'
  FuncionarioAsignado: nombre_completo: 'tal nombre'
*/