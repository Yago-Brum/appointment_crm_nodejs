// src/services/appointmentService.js

import axios from 'axios';

// Define a URL base para a API de agendamentos
// process.env.REACT_APP_API_URL deve ser 'http://localhost:5000/api'
const API_URL = process.env.REACT_APP_API_URL + '/appointments';

// Configurações padrão para requisições com credenciais (cookies)
const config = {
    withCredentials: true
};

// @desc    Obter todos os agendamentos
// @route   GET /api/appointments
export const getAllAppointments = async () => {
    try {
        const response = await axios.get(API_URL, config);
        return response.data; // Retorna { success: true, count: ..., data: [...] }
    } catch (error) {
        console.error('Erro ao buscar todos os agendamentos:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// @desc    Obter um agendamento por ID
// @route   GET /api/appointments/:id
export const getAppointmentById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, config);
        return response.data; // Retorna { success: true, data: { ...appointment } }
    } catch (error) {
        console.error(`Erro ao buscar agendamento com ID ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// @desc    Criar um novo agendamento
// @route   POST /api/appointments
export const createAppointment = async (appointmentData) => {
    try {
        const response = await axios.post(API_URL, appointmentData, config);
        return response.data; // Retorna { success: true, data: { ...newAppointment } }
    } catch (error) {
        console.error('Erro ao criar agendamento:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// @desc    Atualizar um agendamento por ID
// @route   PUT /api/appointments/:id
export const updateAppointment = async (id, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updateData, config);
        return response.data; // Retorna { success: true, data: { ...updatedAppointment } }
    } catch (error) {
        console.error(`Erro ao atualizar agendamento com ID ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// @desc    Excluir um agendamento por ID
// @route   DELETE /api/appointments/:id
export const deleteAppointment = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, config);
        return response.data; // Retorna { success: true, data: {} }
    } catch (error) {
        console.error(`Erro ao excluir agendamento com ID ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// @desc    Obter agendamentos para hoje
// @route   GET /api/appointments/today
export const getAppointmentsForToday = async () => {
    try {
        const response = await axios.get(`${API_URL}/today`, config);
        return response.data; // Retorna { success: true, count: ..., data: [...] }
    } catch (error) {
        console.error('Erro ao buscar agendamentos para hoje:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// @desc    Atualizar apenas o status de um agendamento
// @route   PATCH /api/appointments/:id/status
export const updateAppointmentStatus = async (id, newStatus) => {
    try {
        const response = await axios.patch(`${API_URL}/${id}/status`, { status: newStatus }, config);
        return response.data; // Retorna { success: true, data: { ...updatedAppointment } }
    } catch (error) {
        console.error(`Erro ao atualizar status do agendamento com ID ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// @desc    Obter agendamentos por ID de Cliente
// @route   GET /api/appointments/client/:clientId
export const getAppointmentsByClient = async (clientId) => {
    try {
        const response = await axios.get(`${API_URL}/client/${clientId}`, config);
        return response.data; // Retorna { success: true, count: ..., data: [...] }
    } catch (error) {
        console.error(`Erro ao buscar agendamentos para o cliente ${clientId}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// Agrupa todas as funções de serviço em um objeto para exportação padrão
const appointmentService = {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsForToday,
    updateAppointmentStatus,
    getAppointmentsByClient,
};

export default appointmentService;