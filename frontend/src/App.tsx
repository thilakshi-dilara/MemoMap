import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { AppRoutes } from './routes/AppRoutes';
import './styles/app.css';

export default function App() {
  const init = useAuth((state) => state.init);
  useEffect(() => {
    void init();
  }, [init]);
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
