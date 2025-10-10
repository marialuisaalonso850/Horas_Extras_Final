import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { resetPasswordService } from '@/services/resetPassword/resetPasswordService';
import logo from '../assets/logoepa.png';

export const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1=correo, 2=código, 3=nueva contraseña
  const [email, setEmail] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Paso 1: solicitar código
  const onSubmitEmail = async (data) => {
    setApiError('');
    setSuccessMsg('');
    try {
      const response = await resetPasswordService.solicitarReset({
        email: data.email,
      });
      if (response?.ok) {
        setEmail(data.email);
        setSuccessMsg(response.msg);
        setStep(2);
      } else {
        setApiError(response?.msg || 'Error al solicitar código');
      }
    } catch (error) {
      setApiError('Ocurrió un error. Inténtalo de nuevo.');
    }
  };

  // Paso 2: verificar código
  const onSubmitCodigo = async (data) => {
    setApiError('');
    setSuccessMsg('');
    try {
      const response = await resetPasswordService.verificarCodigo({
        email,
        codigo: data.codigo,
      });
      if (response?.ok) {
        setSuccessMsg(response.msg);
        setStep(3);
      } else {
        setApiError(response?.msg || 'Código inválido');
        
      }
    } catch (error) {
      setApiError('Ocurrió un error. Inténtalo de nuevo.');
    }
  };

  // Paso 3: resetear contraseña
  const onSubmitPassword = async (data) => {
    setApiError('');
    setSuccessMsg('');
    try {
      const response = await resetPasswordService.resetPassword({
        email: data.email,
        nuevaPassword: data.nuevaPassword,
        confirmarPassword: data.confirmarPassword,
      });
      if (response?.ok) {
        setSuccessMsg(response.msg);
        reset();
        // Redirige al login después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setApiError(response?.msg || 'No se pudo cambiar la contraseña');
      }
    } catch (error) {
      setApiError('Ocurrió un error. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-[url(/assets/epaRecoleccion.jpeg)] bg-epaColor/60 bg-blend-soft-light bg-cover bg-center flex justify-center items-center h-screen">
      <div className="bg-white/80 rounded-xl shadow-2xl w-96 p-6">
        <div>
          <img src={logo} alt="logo" />
        </div>
        <h2 className="text-epaColor text-2xl font-bold text-center p-6">
          Recuperar Contraseña
        </h2>
        {/* Mensajes de error o éxito */}
        {apiError && (
          <div className="bg-red-100/60 border border-red-400 text-red-700 font-semibold px-4 py-3 rounded-lg relative mb-4">
            {apiError}
          </div>
        )}
        {successMsg && (
          <div className="bg-epaColor/30 border border-epaColor text-epaColor font-semibold px-4 py-3 rounded-lg relative mb-4">
            {successMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmit(onSubmitEmail)}>
            <div className="pb-4">
              <label className="text-epaColor block pb-2 font-medium">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full p-1 border border-epaColor rounded-md"
                {...register('email', {
                  required: 'El correo electrónico es obligatorio',
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-epaColor w-full text-white rounded-xl p-1.5 mb-4 border border-transparent hover:border-black hover:bg-blue-100 hover:text-epaColor hover:font-semibold"
            >
              Enviar código
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-600 w-full text-white rounded-xl p-1.5 mb-4 border border-transparent hover:border-black hover:bg-gray-100 hover:text-epaColor hover:font-semibold"
            >
              Regresar
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmitCodigo)}>
            <div className="pb-4">
              <label className="text-epaColor block pb-2 font-medium">
                Código de verificación
              </label>
              <input
                type="text"
                className="w-full p-1 border border-epaColor rounded-md"
                {...register('codigo', {
                  required: 'El código es obligatorio',
                })}
              />
              {errors.codigo && (
                <p className="text-red-500 text-sm">{errors.codigo.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-epaColor w-full text-white rounded-xl hover:bg-blue-100 hover:text-epaColor p-1.5 mb-4"
            >
              Verificar código
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit(onSubmitPassword)}>
            <div className="pb-4">
              <label className="text-epaColor block pb-2 font-medium">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full p-1 border border-epaColor rounded-md"
                defaultValue={email} // prellenamos con el email ya guardado
                {...register('email', {
                  required: 'El correo electrónico es obligatorio',
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="pb-4">
              <label className="text-epaColor block pb-2 font-medium">
                Nueva contraseña
              </label>
              <input
                type="password"
                className="w-full p-1 border border-epaColor rounded-md"
                {...register('nuevaPassword', {
                  required: 'La contraseña es obligatoria',
                  minLength: {
                    value: 8,
                    message: 'Mínimo 8 caracteres',
                  },
                })}
              />
              {errors.nuevaPassword && (
                <p className="text-red-500 text-sm">
                  {errors.nuevaPassword.message}
                </p>
              )}
            </div>

            <div className="pb-4">
              <label className="text-epaColor block pb-2 font-medium">
                Confirmar contraseña
              </label>
              <input
                type="password"
                className="w-full p-1 border border-epaColor rounded-md"
                {...register('confirmarPassword', {
                  required: 'Debe confirmar la contraseña',
                })}
              />
              {errors.confirmarPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmarPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-epaColor w-full text-white rounded-xl hover:bg-blue-100 hover:text-epaColor p-1.5 mb-4"
            >
              Cambiar contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
