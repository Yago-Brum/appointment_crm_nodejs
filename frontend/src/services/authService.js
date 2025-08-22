// src/services/authService.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/auth'; // URL base para as rotas de autenticação

// Configurações padrão para requisições com credenciais (cookies)
const config = {
    withCredentials: true
};

// Função para registrar um novo usuário
export const register = async (userData) => { // userData = { name, email, password, role }
    try {
        const response = await axios.post(`${API_URL}/register`, userData, config);
        return response.data; // Retorna { success: true, user: {...}, token: "..." } (ou o que o seu backend retornar)
    } catch (error) {
        console.error('Erro no registro:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Função para fazer login
export const login = async (credentials) => { // credentials = { email, password }
    try {
        const response = await axios.post(`${API_URL}/login`, credentials, config);
        return response.data; // Retorna { success: true, user: {...}, token: "..." }
    } catch (error) {
        console.error('Erro no login:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Função para fazer logout
export const logout = async () => {
    try {
        const response = await axios.get(`${API_URL}/logout`, config); // Ou .post, dependendo do backend
        return response.data;
    } catch (error) {
        console.error('Erro no logout:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Função para obter dados do usuário logado (usado pelo AuthProvider)
export const getMe = async () => {
    try {
        // Esta rota é /api/users/me (não /api/auth/me)
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, config);
        return response.data; // Retorna { success: true, data: { ...user } }
    } catch (error) {
        console.error('Erro ao buscar usuário logado (getMe):', error.response ? error.response.data : error.message);
        throw error;
    }
};

const authService = {
    register,
    login,
    logout,
    getMe,
};

export default authService;