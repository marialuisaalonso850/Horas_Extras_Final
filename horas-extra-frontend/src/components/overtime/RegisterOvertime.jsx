import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { funcionariosService, horasExtraService } from '../../services';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { OverTimeRecordTable } from '@/components/overtime/OverTimeRecordTable';
import { LoadSpinner } from '../spinners/LoadSpinner';

export const RegisterOvertime = ({ onBack }) => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [hojasExcel, setHojasExcel] = useState([]);
  const [registroHorasExtra, setRegistroHorasExtra] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register: registerHoras,
    handleSubmit: handleSubmitHoras,
    reset: resetHoras,
    formState: { errors: errorsHoras },
  } = useForm();

  const {
    control: controlExcel,
    handleSubmit: handleSubmitExcel,
    reset: resetExcel,
    formState: { errors: errorsExcel },
  } = useForm();

  const fileInputRef = useRef(null); // 👈 para limpiar input file real

  useEffect(() => {
    const getFuncionarios = async () => {
      try {
        const res = await funcionariosService.listarFuncionarios();
        setFuncionarios(res.data);
      } catch (error) {
        console.error('Error cargando funcionarios', error);
      }
    };

    getFuncionarios();
  }, []);

  const onSubmit = async (data) => {
    try {
      const response = await horasExtraService.crearExtras(data);
      setRegistroHorasExtra(response.data);
      resetHoras();
      setIsError(false);
      setModalMessage('Horas extra registradas con éxito');
    } catch (error) {
      setIsError(true);
      setModalMessage(error.message);
    } finally {
      setOpenModal(true);
    }
  };

  const onSubmitExcel = async (data) => {
    setLoading(true)
    const file = data.file;
    const sheet = data.sheet;

    if (!file) {
      setIsError(true);
      setModalMessage('Selecciona un archivo primero');
      setOpenModal(true);
      return;
    }

    if (!sheet) {
      setIsError(true);
      setModalMessage('Selecciona una hoja de Excel');
      setOpenModal(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('nombreHoja', sheet);

    try {
      const response = await horasExtraService.importarExtras(formData);
      setIsError(false);
      setModalMessage(response.message || 'Archivo subido con éxito');
    } catch (error) {
      setIsError(true);
      setModalMessage(error.message || 'Error al subir el archivo');
    } finally {
      resetExcel({ file: null, sheet: '' }); // limpia RHF
      if (fileInputRef.current) fileInputRef.current.value = ''; // limpia input real
      setLoading(false)
      setHojasExcel([]); // limpia select
      setOpenModal(true);
    }
  };

  const getNombreHojas = async (file) => {
    if (!file) {
      console.log('Selecciona un archivo primero');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await horasExtraService.obtenerNombreHojasExcel(formData);
      setHojasExcel(response.sheetNames);
    } catch (error) {
      setIsError(true);
      setModalMessage(error.message);
      setOpenModal(true);
    }
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
      <div className="flex flex-col items-center">
        <h2 className="text-epaColor text-center text-4xl font-extrabold pt-2 pb-4">
          Registro de Horas Extra
        </h2>
        <form
          className="bg-white p-5 w-1/2 rounded-xl shadow-2xl mb-5"
          onSubmit={handleSubmitHoras(onSubmit)}
        >
          <div className="pb-5">
            <label className="flex flex-col">
              <span className="text-epaColor font-semibold">Funcionario</span>
              <select
                className="border border-gray-500 rounded-md p-1"
                {...registerHoras('FuncionarioAsignado', {
                  required: true,
                })}
              >
                <option value="">Seleccione un funcionario</option>
                {funcionarios.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.nombre_completo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6 pb-5">
            <div className="flex justify-between items-center">
              <label className="flex flex-col w-4/5">
                <span className="text-epaColor font-semibold">
                  Fecha Inicio Trabajo
                </span>
                <input
                  type="date"
                  className="border border-gray-500 rounded-md p-1"
                  {...registerHoras('fecha_inicio_trabajo', {
                    required:
                      'La fecha de inicio de la jornada laboral es obligatoria',
                  })}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-epaColor font-semibold">Festivo</span>
                <input type="checkbox" {...registerHoras('es_festivo_Inicio')} />
              </label>
            </div>

            <label className="flex flex-col">
              <span className="text-epaColor font-semibold">
                Hora Inicio Trabajo
              </span>
              <input
                type="time"
                className="border border-gray-500 rounded-md p-1"
                {...registerHoras('hora_inicio_trabajo', {
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
                  {...registerHoras('fecha_fin_trabajo', {
                    required:
                      'La fecha de culminación de la jornada laboral es obligatoria',
                  })}
                />
              </label>
              <label className="flex flex-col">
                <span className="text-epaColor font-semibold">Festivo</span>
                <input type="checkbox" {...registerHoras('es_festivo_Fin')} />
              </label>
            </div>

            <label className="flex flex-col">
              <span className="text-epaColor font-semibold">
                Hora Fin Trabajo
              </span>
              <input
                type="time"
                className="border border-gray-500 rounded-md p-1"
                {...registerHoras('hora_fin_trabajo', {
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
                {...registerHoras('fecha_inicio_descanso')}
              />
            </label>

            <label className="flex flex-col">
              <span className="text-epaColor font-semibold">
                Hora Inicio Descanso
              </span>
              <input
                type="time"
                className="border border-gray-500 rounded-md p-1"
                {...registerHoras('hora_inicio_descanso')}
              />
            </label>

            <label className="flex flex-col">
              <span className="text-epaColor font-semibold">
                Fecha Fin Descanso
              </span>
              <input
                type="date"
                className="border border-gray-500 rounded-md p-1"
                {...registerHoras('fecha_fin_descanso')}
              />
            </label>

            <label className="flex flex-col">
              <span className="text-epaColor font-semibold">
                Hora Fin Descanso
              </span>
              <input
                type="time"
                className="border border-gray-500 rounded-md p-1"
                {...registerHoras('hora_fin_descanso')}
              />
            </label>
          </div>
          <label className="flex flex-col">
            <span className="text-epaColor font-semibold">Observaciones</span>
            <textarea
              type="text"
              className="border border-gray-500 rounded-md p-1 resize-none mb-5"
              {...registerHoras('observaciones')}
            />
          </label>
          <button
            type="submit"
            className="bg-epaColor w-1/2 text-white rounded-xl p-1.5 border border-transparent mx-auto block hover:border-black hover:bg-blue-100 hover:text-epaColor hover:font-semibold"
          >
            Registrar
          </button>
        </form>

        <h3 className="text-epaColor text-center text-2xl font-extrabold pt-2 pb-4">
          Importar Excel de Horas Extra
        </h3>
        <form
          onSubmit={handleSubmitExcel(onSubmitExcel)}
          className="bg-white w-1/2 rounded-xl shadow-2xl p-5 mb-4"
        >
          {/* Input de archivo Excel */}
          <label className="flex flex-col mb-5">
            <span className="text-epaColor font-semibold">Archivo Excel</span>
            <Controller
              name="file"
              control={controlExcel}
              rules={{ required: 'Debe subir un archivo de excel' }}
              render={({ field }) => (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="border border-gray-500 rounded-md p-1"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file || null);
                    if (file) getNombreHojas(file);
                  }}
                />
              )}
            />
            {errorsExcel.file && (
              <p className="text-red-500 text-sm mt-1">
                {errorsExcel.file.message}
              </p>
            )}
          </label>

          {/* Select de hoja */}
          <label className="flex flex-col">
            <span className="text-epaColor font-semibold">Hoja de Excel</span>
            <Controller
              name="sheet"
              control={controlExcel}
              rules={{
                required: 'Debe elegir la hoja de excel que desea subir',
              }}
              render={({ field }) => (
                <select
                  className="border border-gray-500 rounded-md p-1"
                  {...field}
                >
                  <option value="">
                    Seleccione la hoja que desea importar
                  </option>
                  {hojasExcel.map((hojaExcel, index) => (
                    <option key={index} value={hojaExcel}>
                      {hojaExcel}
                    </option>
                  ))}
                </select>
              )}
            />
            {errorsExcel.sheet && (
              <p className="text-red-500 text-sm mt-1">
                {errorsExcel.sheet.message}
              </p>
            )}
          </label>

          <button
            type="submit"
            className="bg-epaColor w-1/2 text-white rounded-xl p-1.5 border border-transparent mx-auto block hover:border-black hover:bg-blue-100 hover:text-epaColor hover:font-semibold mt-5"
          >
            Subir Archivo
          </button>
        </form>

        {loading && ( <LoadSpinner styles='fixed bg-gray-200/95' name='Importando Excel' /> )}

        <OverTimeRecordTable
          data={registroHorasExtra}
          onDeleteSuccess={() => setRegistroHorasExtra({})}
        />

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-epaColor text-3xl text-center font-bold mb-2">
                {isError ? 'Error' : 'Registro Exitoso'}
              </DialogTitle>
              <DialogDescription className="text-xl text-center font-semibold mb-2">
                {modalMessage}
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={() => setOpenModal(false)}
              className="bg-epaColor w-1/2 text-white rounded-xl p-1.5 border border-transparent mx-auto block hover:border-black hover:bg-blue-100 hover:text-epaColor hover:font-semibold"
            >
              Cerrar
            </button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};