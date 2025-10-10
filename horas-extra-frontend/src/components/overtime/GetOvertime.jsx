import { useEffect, useState } from "react";
import { horasExtraService } from "@/services"
import { LoadSpinner } from "../spinners/LoadSpinner";

export const GetOvertime = ({ onBack }) => {

  const [horasExtra, setHorasExtra] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHorasExtra();
  }, [])

  const getHorasExtra = async() => {
    try {
      const response = await horasExtraService.listarExtras();
      setHorasExtra(response.data);
    } catch (error) {
      console.error('Error cargando horas extra', error);      
    } finally {
      setLoading(false);
    }  
  };

  const abrirModal = (id) => {
    setIdSeleccionado(id);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setIdSeleccionado(null);
    setMostrarModal(false);
  };

  const eliminarHorasExtra = async(id) => {
    try {
      const response = await horasExtraService.eliminarExtras(id);
      setHorasExtra(horasExtra.filter(r => r._id !== id));
      cerrarModal();      
    } catch (error) {
      console.error('Error eliminando horas extra', extra);
    }
  }

  const formatDate = (value) => {
    return value ? new Date(value).toISOString().split("T")[0] : "—";
  };

  const formatHour = (value) => {
    return value && value.trim() !== "" ? value : "—";
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
      <h2 className="text-epaColor text-center text-4xl font-extrabold pt-2 pb-4">
        Registro Individual de Horas Extra
      </h2>
      
      <div className="bg-white shadow-md rounded-lg p-6 mx-auto mt-6">
        <table className="w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-epaColor h-8 text-left text-sm font-semibold text-white uppercase">
            <tr>
              <th className="py-4">Identificación</th>
              <th>Nombre</th>
              <th>Fecha creación</th>
              <th>Inicio trabajo</th>
              <th>Fin trabajo</th>
              <th>Hora inicio<br />trabajo</th>
              <th>Hora fin<br />trabajo</th>
              <th>Inicio descanso</th>
              <th>Fin descanso</th>
              <th>Hora inicio<br />descanso</th>
              <th>Hora fin<br />descanso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {horasExtra.map((registro) => (
              <tr key={registro._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2">{registro.FuncionarioAsignado?.identificacion}</td>
                <td>{registro.FuncionarioAsignado?.nombre_completo}</td>
                <td>{new Date(registro.createdAt).toISOString().split("T")[0]}</td>
                <td>{new Date(registro.fecha_inicio_trabajo).toISOString().split("T")[0]}</td>
                <td>{new Date(registro.fecha_fin_trabajo).toISOString().split("T")[0]}</td>
                <td>{registro.hora_inicio_trabajo}</td>
                <td>{registro.hora_fin_trabajo}</td>
                <td>{formatDate(registro.fecha_inicio_descanso)}</td>
                <td>{formatDate(registro.fecha_fin_descanso)}</td>
                <td>{formatHour(registro.hora_inicio_descanso)}</td>
                <td>{formatHour(registro.hora_fin_descanso)}</td>
                <td className="space-x-1 space-y-1">
                  <button
                    onClick={() => abrirModal(registro._id)}
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

        {horasExtra.length === 0 && (
          <div className="text-center text-xl text-gray-500 font-semibold py-8">
            No se encontraron registros de horas extra
          </div>
        )}
      </div>
      {loading && ( <LoadSpinner styles='absolute bg-gray-200/95' /> )}
      {mostrarModal && (
        <div className="fixed inset-0 bg-epaColor/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
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
    </>
  )
}