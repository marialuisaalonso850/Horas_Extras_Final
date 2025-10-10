import { useState } from "react";
import { horasExtraService } from "@/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const OverTimeRecordTable = ({ data, onDeleteSuccess }) => {
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState('');
  const [openResultModal, setOpenResultModal] = useState(false); // modal de resultado (éxito/error)
  const [showConfirmModal, setShowConfirmModal] = useState(false); // modal de confirmación

  const abrirConfirm = () => setShowConfirmModal(true);
  const cerrarConfirm = () => setShowConfirmModal(false);

  const handleDelete = async (idHoraExtra) => {
    console.log('handleDelete called ->', idHoraExtra);
    try {
      const response = await horasExtraService.eliminarExtras(idHoraExtra);
      const success = !!response?.success;
      setMensaje(response?.message || (success ? 'El registro se eliminó' : 'Ocurrió un error'));
      setEstado(success ? 'Registro Eliminado' : 'Error');

      // cerrar el modal de confirmación inmediatamente
      cerrarConfirm();

      // abrir modal de resultado para que el usuario lo vea
      setOpenResultModal(true);

      if (success) {
        // esperar 2s para que el usuario vea el modal y luego avisar al padre y cerrar modal
        setTimeout(() => {
          if (typeof onDeleteSuccess === 'function') onDeleteSuccess();
          setOpenResultModal(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error eliminando:', error);
      setMensaje(error?.message || String(error));
      setEstado('Error');
      setOpenResultModal(true);
    }
  };

  const renderRow = (label, value, isDate = false) => {
    if (!value) return null;
    return (
      <tr key={label}>
        <td className="px-4 py-2 font-semibold">{label}</td>
        <td className="px-4 py-2">
          {isDate ? new Date(value).toISOString().split('T')[0] : value}
        </td>
      </tr>
    );
  };

  if (!data || Object.keys(data).length === 0)
    return <p className="text-epaColor font-semibold">No hay Registro</p>;

  return (
    <>
      <table className="w-1/2 border border-gray-300 shadow-2xl rounded-xl overflow-hidden">
        <thead className="bg-epaColor text-white">
          <tr>
            <th className="px-4 py-2 text-left">Campo</th>
            <th className="px-4 py-2 text-left">Valor</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-2 font-semibold">Funcionario Asignado</td>
            <td className="px-4 py-2">
              {data?.FuncionarioAsignado?.nombre_completo ?? '—'}
            </td>
          </tr>

          {renderRow('Fecha Inicio Trabajo', data.fecha_inicio_trabajo, true)}
          {renderRow('Fecha Fin Trabajo', data.fecha_fin_trabajo, true)}
          {renderRow('Hora Inicio Trabajo', data.hora_inicio_trabajo)}
          {renderRow('Hora Fin Trabajo', data.hora_fin_trabajo)}

          {renderRow('Fecha Inicio Descanso', data.fecha_inicio_descanso, true)}
          {renderRow('Fecha Fin Descanso', data.fecha_fin_descanso, true)}
          {renderRow('Hora Inicio Descanso', data.hora_inicio_descanso)}
          {renderRow('Hora Fin Descanso', data.hora_fin_descanso)}
          {renderRow('Observaciones', data.observaciones)}

          <tr>
            <td className="px-4 py-2 font-semibold">Festivo Inicio</td>
            <td className="px-4 py-2">{data.es_festivo_Inicio ? 'Sí' : 'No'}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-semibold">Festivo Fin</td>
            <td className="px-4 py-2">{data.es_festivo_Fin ? 'Sí' : 'No'}</td>
          </tr>

          <tr>
            <td colSpan={2} className="px-4 py-2">
              <button
                onClick={abrirConfirm}
                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-800 transition block mx-auto"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* modal de confirmación personalizado */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-epaColor/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-4">
              <button onClick={cerrarConfirm} className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition">Cancelar</button>
              <button onClick={() => handleDelete(data._id)} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de resultado (éxito/error) */}
      <Dialog open={openResultModal} onOpenChange={setOpenResultModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`text-4xl text-center font-semibold mb-2 ${estado === "Error" ? "text-red-500" : "text-epaColor"}`}>
              {estado}
            </DialogTitle>
            <DialogDescription className={'text-xl text-center font-semibold mb-2'}>{mensaje}</DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setOpenResultModal(false)}
            className="bg-epaColor w-1/2 text-white rounded-xl p-1.5 border border-transparent mx-auto block hover:border-black hover:bg-blue-100 hover:text-epaColor hover:font-semibold"
          >
            Cerrar
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};
