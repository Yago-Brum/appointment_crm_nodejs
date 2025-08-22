// src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService'; // Importa o serviço de autenticação

// Cria o contexto de autenticação
const AuthContext = createContext(null);

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Armazena os dados do usuário logado (id, name, email, role)
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Flag de autenticação
    const [loading, setLoading] = useState(true); // Indica se o estado de autenticação está sendo carregado

    // Função para verificar o status de login ao carregar a aplicação
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Tenta buscar os dados do usuário logado do backend
                // Se for bem-sucedido, o cookie HTTP-only foi enviado e o token é válido
                const response = await authService.getMe();
                setUser(response.data); // backend retorna { success: true, data: user }
                setIsAuthenticated(true);
            } catch (error) {
                // Se falhar (ex: 401 Unauthorized), o usuário não está autenticado
                console.log('Nenhum usuário logado ou token expirado:', error.message);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []); // Executa apenas uma vez ao montar o componente AuthProvider

    // Funções de login e registro que atualizam o estado
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await authService.login({ email, password });
            setUser(response.data.user); // A resposta do login inclui { user: { ... } }
            setIsAuthenticated(true);
            setLoading(false);
            return response.data; // Retorna os dados para o componente de login
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            throw error; // Propaga o erro para o componente de login
        }
    };

    const register = async (name, email, password, role) => {
        setLoading(true);
        try {
            const response = await authService.register({ name, email, password, role });
            setUser(response.data.user);
            setIsAuthenticated(true);
            setLoading(false);
            return response.data;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Mesmo com erro, assumimos que o logout do frontend deve ocorrer
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            throw error;
        }
    };

    // Valor que será fornecido pelo contexto
    const authContextValue = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        // Você pode adicionar uma função para atualizar o perfil do usuário também
        // updateUser: async (updates) => { ... }
    };

    if (loading) {
        // Opcional: Renderizar um spinner de carregamento inicial para o aplicativo
        // enquanto a autenticação está sendo verificada
        return <div>Verificando autenticação...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook customizado para consumir o contexto de autenticação
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

// Exporta o hook para ser usado em componentes
export default useAuth;