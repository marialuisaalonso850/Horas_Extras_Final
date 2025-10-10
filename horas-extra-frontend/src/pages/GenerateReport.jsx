import { useState } from 'react';
import { OverTimeTable } from '@/components/overtime/OverTimeTable';
import { useForm } from 'react-hook-form';
import { reportesService } from '@/services';

export const GenerateReport = () => {
  const [reporte, setReporte] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data, e) => {
    try {
      const action = e.nativeEvent.submitter.name;

      if (action === 'generar') {
        const response = await reportesService.crearReporte(data);
        console.log('Log de la data ', data);

        setReporte(response.data);
        console.log('Log del reporte ', reporte);

        setMostrarTabla(true);
      }

      if (action === 'excel') {
        const res = await reportesService.exportarReporteExcel(data);
        const contentDisposition = res.headers['content-disposition'];
        let filename = 'reporte_horas_extra.xlsx';

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) filename = match[1];
        }

        const blob = new Blob([res.data], {
          type: res.headers['content-type'],
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); 
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

    } catch (error) {
      const message = error || 'Ocurrio un error generando el reporte';
      console.error(message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex m-4">
          <button
            type="submit"
            name="generar"
            className="bg-epaColor text-white cursor-pointer w-1/3 rounded-2xl p-1 mx-auto block"
          >
            Generar Reporte
          </button>
          <button
            type="submit"
            name="excel"
            className="bg-epaColor text-white cursor-pointer w-1/3 rounded-2xl p-1 mx-auto block"
          >
            Generar Reporte Excel
          </button>
        </div>
        <div className="flex justify-between p-2">
          <label className="flex flex-col w-1/4">
            <span className="text-epaColor text-lg font-bold">
              Fecha Inicio
            </span>
            <input
              type="date"
              className="bg-white p-1 rounded-md border border-gray-500"
              {...register('fechaInicio', {
                required: 'La fecha de inicio es obligatoria',
              })}
            />
            {errors.fechaInicio && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fechaInicio.message}
              </p>
            )}
          </label>
          <label className="flex flex-col w-1/4">
            <span className="text-epaColor text-lg font-bold">Fecha Fin</span>
            <input
              type="date"
              className="bg-white p-1 rounded-md border border-gray-500"
              {...register('fechaFin', {
                required: 'La fecha de fin es obligatoria',
              })}
            />
            {errors.fechaFin && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fechaFin.message}
              </p>
            )}
          </label>
          <label className="flex flex-col w-1/4">
            <span className="text-epaColor text-lg font-bold">
              Tipo de Operario
            </span>
            <select
              className="bg-white p-1 rounded-md border border-gray-500"
              {...register('tipoOperario', {
                required: 'Debe ingresar el tipo de funcionario',
              })}
            >
              <option value="">Seleccione el tipo de Operario</option>
              <option value="Planta">Planta</option>
              <option value="Temporal">Temporal</option>
            </select>
            {errors.tipoOperario && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tipoOperario.message}
              </p>
            )}
          </label>
        </div>
      </form>
      <div className="mt-5 space-y-6">
        <h3 className="text-center text-epaColor font-semibold text-3xl">
          Reporte
        </h3>
        {mostrarTabla && <OverTimeTable registros={reporte} />}
      </div>
    </>
  );
};
