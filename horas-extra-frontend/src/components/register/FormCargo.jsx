import { cargosService } from '@/services/cargos/cargosService';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {   Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
 } from '@/components/ui/dialog';

export const FormCargo = ({ onBack }) => {

  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await cargosService.crearCargo(data);
      console.log(response);
      setMensaje(response.message);
      setEstado(response.ok ? "Registro Exitoso" : "Error");
      reset();
    } catch(error) {
      console.error(error);      
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
          Registrar Cargo
        </h2>
        <form
          className="bg-white p-5 w-1/2 rounded-xl shadow-2xl mb-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="flex flex-col">
            <span className="text-epaColor font-semibold text-2xl pb-2">
              Cargo
            </span>
            <input
              type="text"
              className="border border-gray-500 rounded-md p-2 mb-6"
              {...register('name', {
                required: 'Ingresar un cargo es obligatorio',
              })}
            />
          </label>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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
