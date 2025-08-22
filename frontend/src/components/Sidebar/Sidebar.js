// src/components/Sidebar/Sidebar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importe o useAuth
import { FaUser, FaCalendarAlt, FaClipboardList, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'; // Ícones para Dashboard, etc.
import './Sidebar.css'; // Opcional: seu arquivo CSS para a sidebar

const Sidebar = () => {
    const { isAuthenticated, user, logout } = useAuth(); // Obtenha isAuthenticated, user e logout do contexto
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout(); // Chama a função de logout do contexto
            navigate('/login', { replace: true }); // Redireciona para a página de login após o logout
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Mesmo se houver um erro, você pode querer forçar o redirecionamento
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Appointment CRM</h3>
            </div>
            <ul className="sidebar-menu">
                {isAuthenticated && ( // Mostra o Dashboard apenas se autenticado
                    <li>
                        <Link to="/dashboard">
                            <FaTachometerAlt /> Dashboard
                        </Link>
                    </li>
                )}
                {isAuthenticated && ( // Mostra Clientes apenas se autenticado
                    <li>
                        <Link to="/clients">
                            <FaUser /> Clientes
                        </Link>
                    </li>
                )}
                {isAuthenticated && ( // Mostra Agendamentos apenas se autenticado
                    <li>
                        <Link to="/appointments">
                            <FaCalendarAlt /> Agendamentos
                        </Link>
                    </li>
                )}
                {/* Você pode adicionar mais itens de menu aqui, talvez com base na role do usuário */}
                {/* Por exemplo, um link para a página de usuários para administradores */}
                {user && user.role === 'admin' && (
                    <li>
                        <Link to="/users"> {/* Crie esta rota e página futuramente */}
                            <FaClipboardList /> Usuários
                        </Link>
                    </li>
                )}
            </ul>
            <div className="sidebar-footer">
                {isAuthenticated ? (
                    <>
                        <p className="logged-in-user">
                            Logado como: {user ? user.name : 'Usuário'} ({user ? user.role : ''})
                        </p>
                        <button onClick={handleLogout} className="logout-button">
                            <FaSignOutAlt /> Sair
                        </button>
                    </>
                ) : (
                    <p>Não Logado</p> // Opcional: ou você pode esconder a sidebar inteira se não logado
                )}
            </div>
        </div>
    );
};

export default Sidebar;