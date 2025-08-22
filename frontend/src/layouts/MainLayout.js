// src/layouts/MainLayout.js

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import './MainLayout.css'; // Crie este arquivo CSS para o layout principal

const MainLayout = () => {
  return (
    <div className="main-layout-wrapper"> {/* Um wrapper para o layout */}
      {/* Sidebar fixa */}
      <Sidebar />

      {/* Conteúdo principal ocupando o espaço restante */}
      {/* Adicione uma classe para aplicar o margin-left */}
      <div className="main-content-area"> 
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;