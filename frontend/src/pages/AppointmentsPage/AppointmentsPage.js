import React, { useEffect, useState, useCallback } from 'react';
// Importe os serviços em vez de axiosInstance diretamente
import appointmentService from '../../services/appointmentService';
import clientService from '../../services/clientService'; // Para buscar nomes de clientes
import moment from 'moment';
import { FaUserAlt, FaRegCalendarAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
// Ajuste o caminho para NewAppointmentModal se ele estiver em 'components'
import NewAppointmentModal from '../../components/Appointments/NewAppointmentModal';
import { useLocation } from 'react-router-dom';
import './AppointmentsPage.css'; // Ajuste o nome do arquivo CSS para refletir a nova estrutura

const AppointmentsPage = () => { // Renomeado de 'Appointments' para 'AppointmentsPage'
    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [newAppointment, setNewAppointment] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const location = useLocation();
    const [isHiding, setIsHiding] = useState(false);

    // Usa useCallback para memoizar a função, útil se passá-la para filhos
    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null); // Limpa erros anteriores

            // Usa o appointmentService para buscar agendamentos
            const appointmentsResponse = await appointmentService.getAllAppointments();
            // A API retorna { success: true, count: ..., data: [...] }
            const appointmentsData = appointmentsResponse.data || [];

            // Usa o clientService para buscar todos os clientes para mapear nomes
            const clientsResponse = await clientService.getAllClients();
            // A API de clientes também retorna { success: true, data: [...] }
            const clientsData = clientsResponse.data || [];

            const clientsMap = {};
            // Assumindo que seu backend de clientes retorna 'id' ou '_id'
            // O modelo de cliente no backend usa '_id', então ajustamos aqui
            clientsData.forEach((client) => {
                clientsMap[client._id] = client; // Use client._id
            });

            const appointmentsWithClientNames = appointmentsData.map((appointment) => {
                // Seu backend já está populando o campo 'client'
                // Então, appointment.client já deve ser o objeto cliente completo ou parte dele
                // Se for o objeto cliente completo, 'appointment.client.name' já funcionaria.
                // Se for apenas o ID, mantemos o mapeamento.
                const clientObj = clientsMap[appointment.client] || appointment.client; // Tenta mapear ou usa o que veio (se já populado)
                return {
                    ...appointment,
                    clientName: clientObj.name || 'Unknown', // Usa o nome do objeto cliente
                };
            });

            setAppointments(appointmentsWithClientNames);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao buscar dados:', err.response ? err.response.data : err.message);
            setError(err); // Define o erro para exibição na UI
            setLoading(false);
        }
    }, []); // Dependências: nenhuma para a função em si, mas useEffect a chama

    // Este callback será chamado após a criação/atualização/deleção de um agendamento
    const handleAppointmentUpdate = useCallback(async () => {
        await fetchAppointments(); // Recarrega a lista
        setEditingAppointment(null);
        setNewAppointment(null);
        setIsModalOpen(false);
        setSuccessMessage('Agendamento atualizado com sucesso!'); // Mensagem de sucesso genérica
    }, [fetchAppointments]);

    useEffect(() => {
        fetchAppointments();

        // Lógica para pré-popular o modal de edição/criação a partir do estado da navegação
        if (location.state?.editingAppointment) {
            setEditingAppointment(location.state.editingAppointment);
            setNewAppointment(null);
            setIsModalOpen(true);
            // Limpa o estado de navegação para evitar reabrir o modal em recargas futuras
            window.history.replaceState({}, document.title);
        }

        if (location.state?.newAppointment) {
            setNewAppointment(location.state.newAppointment);
            setEditingAppointment(null);
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location, fetchAppointments]); // Dependências: location e fetchAppointments

    // Lógica para exibir e esconder a mensagem de sucesso
    useEffect(() => {
        if (successMessage) {
            setIsHiding(false);
            const timer = setTimeout(() => {
                setIsHiding(true);
                setTimeout(() => {
                    setSuccessMessage('');
                }, 300); // Tempo para a animação de esconder
            }, 2000); // Tempo que a mensagem fica visível
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleEdit = (appointment) => {
        setEditingAppointment(appointment);
        setNewAppointment(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingAppointment(null);
        setNewAppointment(null);
        setSuccessMessage(''); // Limpa a mensagem de sucesso ao fechar o modal
    };

    const handleDelete = async (appointment) => {
        if (window.confirm('Tem certeza que deseja deletar este agendamento?')) {
            try {
                // Usa o appointmentService para deletar
                await appointmentService.deleteAppointment(appointment._id); // Use _id
                setSuccessMessage('Agendamento deletado com sucesso.');
                fetchAppointments(); // Recarrega a lista após a deleção
            } catch (err) {
                console.error('Erro ao deletar agendamento:', err.response ? err.response.data : err.message);
                setError('Erro ao deletar agendamento. Por favor, tente novamente.'); // Define um erro para a UI
            }
        }
    };

    if (loading) return <div className="loading">Carregando agendamentos...</div>;

    if (error) {
        return (
            <div className="error-container">
                <h2>Erro ao carregar Agendamentos</h2>
                <p>{error.message || 'Ocorreu um erro desconhecido.'}</p>
                <p>Verifique sua conexão de rede e se você está autenticado.</p>
            </div>
        );
    }

    return (
        <div className="appointments-page"> {/* Use um nome de classe mais específico para a página */}
            <div className="appointments-header">
                <h2>Agendamentos</h2>
                <button
                    className="new-appointment-btn"
                    onClick={() => {
                        setNewAppointment(null); // Garante que não está em modo de criação de nova data
                        setEditingAppointment(null); // Garante que não está em modo de edição
                        setIsModalOpen(true); // Abre o modal em modo de criação
                    }}
                >
                    <FaPlus /> Novo Agendamento
                </button>
            </div>

            {successMessage && (
                <div className={`success-message ${isHiding ? 'hide' : ''}`}>
                    {successMessage}
                </div>
            )}

            {appointments.length === 0 ? (
                <p>Nenhum agendamento encontrado.</p>
            ) : (
                <div className="appointments-list">
                    {appointments.map((appointment) => (
                        // Assegure-se de usar appointment._id para a key
                        <div className="appointment-card" key={appointment._id}>
                            <div className="appointment-header">
                                <h3>{appointment.service}</h3> {/* Usando 'service' como título */}
                            </div>
                            <div className="appointment-body">
                                <p>
                                    <FaUserAlt /> Cliente: {appointment.clientName}
                                </p>
                                <p>
                                    <FaRegCalendarAlt /> Data: {moment(appointment.date).format('MMMM Do YYYY, h:mm A')}
                                </p>
                                {/* Adicione mais detalhes como status, startTime, endTime se desejar */}
                                <p>Status: {appointment.status}</p>
                                <p>Início: {appointment.startTime} - Fim: {appointment.endTime}</p>
                                {appointment.notes && <p>Notas: {appointment.notes}</p>}
                            </div>
                            <div className="appointment-actions">
                                <button className="edit-btn" onClick={() => handleEdit(appointment)}>
                                    <FaEdit /> Editar
                                </button>
                                <button className="delete-btn" onClick={() => handleDelete(appointment)}>
                                    <FaTrash /> Deletar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* O NewAppointmentModal também precisará ser refatorado para usar os services */}
            <NewAppointmentModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onAppointmentCreated={handleAppointmentUpdate} // Chamado ao criar/editar para recarregar a lista
                editingAppointment={editingAppointment}
                newAppointment={newAppointment}
            />
        </div>
    );
};

export default AppointmentsPage;