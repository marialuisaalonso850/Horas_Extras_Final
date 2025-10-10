import { RouterProvider } from 'react-router-dom';
import { routes } from './routes/routes';
import './App.css';

export const App = () => {
  return <RouterProvider router={ routes } />;
};
