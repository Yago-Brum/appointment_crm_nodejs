import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar fixa à esquerda */}
      <Sidebar />

      {/* Área principal com scroll se necessário */}
      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
