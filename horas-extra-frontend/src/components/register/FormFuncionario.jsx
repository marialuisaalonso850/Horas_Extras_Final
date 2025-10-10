import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {   Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { funcionariosService } from '@/services';
import { cargosService } from '@/services/cargos/cargosService';

export const FormFuncionario = ({ onBack }) => {

  const [cargos, setCargos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    const getCargos = async () => {
      try {
        const res = await cargosService.listarCargos();
        setCargos(res.data);
      } catch (error) {
        console.error('Error listando cargos', error);
      }
    };

    getCargos();
  }, []);

  const onSubmit = async (data) => {
    try {
      const response = await funcionariosService.crearFuncionarios(data);
      console.log(response);
      setMensaje(response.message)
      setEstado(response.success ? 'Registro Exitoso' : 'Error')
      reset();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Error inesperado al registrar funcionario';
      console.log(errorMessage);
    } finally {
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
        <h2 className="text-epaColor text-4xl font-extrabold py-4">
          Registrar Funcionario
        </h2>
        <form
          className="bg-white p-5 w-1/2 rounded-xl shadow-2xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="flex flex-col">
            <span className="text-epaColor font-semibold text-2xl pb-2">
              Nombre Completo
            </span>
            <input
              type="text"
              className="border border-gray-500 rounded-md p-2 mb-4"
              {...register('nombre_completo', {
                required: 'Debe ingresar el nombre del funcionario',
              })}
            />
          </label>
          {errors.nombre_completo && (
            <p className="text-red-500 text-sm">
              {errors.nombre_completo.message}
            </p>
          )}
          <label className="flex flex-col">
            <span className="text-epaColor font-semibold text-2xl pb-2">
              Identificación
            </span>
            <input
              type="text"
              className="border border-gray-500 rounded-md p-2 mb-4"
              {...register('identificacion', {
                required: 'Debe ingresar la identificacion del usuario',
              })}
            />
          </label>
          {errors.identificacion && (
            <p className="text-red-500 text-sm mt-1">
              {errors.identificacion.message}
            </p>
          )}
          <label className="flex flex-col">
            <span className="text-epaColor font-semibold text-2xl pb-2">
              Tipo de Operario
            </span>
            <select
              className="border border-gray-500 rounded-md p-2 mb-4"
              {...register('tipoOperario', {
                required:
                  'Debe ingresar el tipo de funcionario',
              })}
            >
              <option value="">Seleccione el tipo de Operario</option>
              <option value="Planta">Planta</option>
              <option value="Temporal">Temporal</option>
            </select>
          </label>
          {errors.tipoOperario && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tipoOperario.message}
            </p>
          )}
          <label className="flex flex-col">
            <span className="text-epaColor font-semibold text-2xl pb-2">
              Cargo
            </span>
            <select
              className="border border-gray-500 rounded-md p-2 mb-4"
              {...register('Cargo', {
                required: 'Debe seleccionar el cargo del funcionario',
              })}
            >
              <option value="">Seleccione el Cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo._id} value={cargo._id}>
                  {cargo.name}
                </option>
              ))}
            </select>
          </label>
          {errors.Cargo && (
            <p className="text-red-500 text-sm mt-1">{errors.Cargo.message}</p>
          )}
          <button
            type="submit"
            className="bg-epaColor text-white rounded-4xl w-1/4 p-2 mx-auto block border-2 border-transparent hover:bg-transparent hover:border-epaColor hover:scale-105 hover:text-epaColor hover:font-semibold transform transition duration-300 ease-in-out"
          >
            Registrar
          </button>
        </form>
      </div>
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
