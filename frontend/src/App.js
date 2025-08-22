// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute'; // Caminho correto para o ProtectedRoute
import MainLayout from './layouts/MainLayout'; // Caminho correto para o MainLayout

// Importações dos componentes de página (ajustados para os novos nomes)
import LoginPage from './pages/Auth/LoginPage'; // Use 'LoginPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'; // Use 'DashboardPage'
import CalendarPage from './pages/CalendarPage/CalendarPage'; // Renomeie seu Calendar para CalendarPage
import ClientsPage from './pages/ClientsPage/ClientsPage'; // Use 'ClientsPage'
import AppointmentsPage from './pages/AppointmentsPage/AppointmentsPage'; // Use 'AppointmentsPage'

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota pública de login */}
          <Route path="/login" element={<LoginPage />} />
          {/* Se você tiver uma rota de registro separada, adicione-a aqui */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          {/* Rota pública para a Home se você tiver uma */}
          {/* <Route path="/" element={<HomePage />} /> */}


          {/* Grupo de rotas protegidas que usarão o MainLayout.
            Qualquer rota aninhada aqui só será renderizada se o ProtectedRoute permitir.
            O MainLayout será o "pai" visual dessas rotas, e o <Outlet /> dentro dele
            renderizará o componente da rota filha correspondente.
          */}
          <Route
            path="/" // Use '/' como path para o layout principal que engloba as rotas protegidas
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Rota Index: Redireciona a raiz protegida ("/") para "/dashboard".
              Isso significa que, se o usuário logar e for para "/", ele será redirecionado para /dashboard.
            */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Rotas filhas que serão renderizadas dentro do <Outlet /> do MainLayout */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />

            {/*
              Exemplo de rota protegida por role (para um futuro UsersManagementPage, por exemplo)
              <Route path="users" element={<ProtectedRoute roles={['admin']}><UsersManagementPage /></ProtectedRoute>} />
            */}
          </Route>

          {/* Rota 404 (página não encontrada) */}
          <Route path="*" element={<div>Página não encontrada</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;