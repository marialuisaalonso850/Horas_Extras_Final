import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GenerateReport, HomePage, Login, Overtime, Register } from '../pages';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/routes/ProtectedRoute';
import { ResetPassword } from '@/pages/ResetPassword';

export const routes = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '*', element: <Navigate to="/" /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'generate-report',
            element: <GenerateReport />,
          },
          {
            path: 'overtime',
            element: <Overtime />,
          },
          {
            path: 'register',
            element: <Register />,
          },
        ],
      },
    ],
  },
]);
