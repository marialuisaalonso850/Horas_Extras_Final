
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logo from '../assets/logoepa.png';
import { UserCheck, House, ClipboardClock, Users, NotebookPen } from 'lucide-react';

const currentYear = new Date().getFullYear();

export const DashboardLayout = () => {

  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen">
      <div className='bg-gray-50 w-1/6 flex flex-col p-4 border-r border-gray-300'>
        <div className='space-y-4 pb-10 text-center'>
          <img src={logo} alt="Logo EPA" />
          <h3 className='text-epaColor text-lg font-bold'>Menu Principal</h3>
          <h4 className='font-medium'>Version 1.0</h4>
        </div>
        <nav className='space-y-4 pb-10'>
          <div className='text-epaColor font-medium'>
            <Link className='flex gap-2 items-center transition-transform duration-300 hover:translate-x-4' to={ '/dashboard' }>
              <House size={20} />
              Inicio
            </Link>
          </div>
          <div className='text-epaColor font-medium'>
            <Link className='flex gap-2 items-center transition-transform duration-300 hover:translate-x-4' to={ '/dashboard/overtime' }>
              <ClipboardClock size={20} />
              Horas Extra
            </Link>
          </div>
          <div className='text-epaColor font-medium'>
            <Link className='flex gap-2 items-center transition-transform duration-300 hover:translate-x-4' to={ '/dashboard/register' }>
              <Users size={20} />
              Funcionarios
            </Link>
          </div>
          <div className='text-epaColor font-medium'>
            <Link className='flex gap-2 items-center transition-transform duration-300 hover:translate-x-4' to={ '/dashboard/generate-report' }>
              <NotebookPen size={20} />
              Reportes
            </Link>
          </div>
        </nav>
        <button
          type="button"
          onClick={logout}
          className="bg-red-600 text-white min-w-9/10 rounded-2xl p-2 mx-auto block hover:bg-red-800 transform hover:scale-105"
        >
          Cerrar sesión
        </button>
      </div>

      <div className='flex flex-col w-full'>
        <header className='bg-epaColor grid grid-cols-3 px-6 py-6'>
          <div></div>
          <h2 className='text-white text-center font-bold text-3xl'>
            Plataforma Horas Extra - EPA
          </h2>
          <div className='flex text-white text-sm items-center justify-end gap-2'>
            <UserCheck />
            <div className='text-right'>
              {user.name} <br /> {user.rol}
            </div>
          </div>
        </header>

        <main className='relative bg-gray-200 flex-1 overflow-auto p-4'>
          <Outlet />
        </main>

        <footer className='bg-epaColor text-white flex justify-between items-center p-4'>
          <div>
            © {currentYear} Empresas Publicas de Armenia E.S.P.
          </div>
          <div>
            Plataforma de Horas Extra Aseo - EPA
          </div>
          <div>
            Contacto de Soporte: <a href="mailto:redes.tic@epa.gov.co">redes.tic&#64;epa.gov.co</a>
            <p>Tel: (606) 741 17 80 Ext. 1512 - 1513</p>
          </div>
        </footer>
      </div>
    </div>
  )
}