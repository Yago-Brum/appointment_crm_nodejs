import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../axiosInstance';
import moment from 'moment';
import { FaUserAlt, FaRegCalendarAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import NewAppointmentModal from './NewAppointmentModal';
import { useLocation } from 'react-router-dom';
import './Appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newAppointment, setNewAppointment] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const [isHiding, setIsHiding] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);

      const appointmentsResponse = await axiosInstance.get('/appointments/');
      const appointmentsData = appointmentsResponse.data.results || [];

      const clientsResponse = await axiosInstance.get('/clients/');
      const clientsData = clientsResponse.data || [];

      const clientsMap = {};
      clientsData.forEach((client) => {
        clientsMap[client.id] = client;
      });

      const appointmentsWithClientNames = appointmentsData.map((appointment) => ({
        ...appointment,
        clientName: clientsMap[appointment.client] ? clientsMap[appointment.client].name : 'Unknown',
      }));

      setAppointments(appointmentsWithClientNames);
      setLoading(false);
    } catch (error) {
      setError(error);
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  const handleAppointmentUpdate = useCallback(async () => {
    await fetchAppointments();
    setEditingAppointment(null);
    setNewAppointment(null);
    setIsModalOpen(false);
    setSuccessMessage('Appointment was successfully updated.');
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
    
    // Check if there's an appointment to edit from the calendar
    if (location.state?.editingAppointment) {
      setEditingAppointment(location.state.editingAppointment);
      setNewAppointment(null);
      setIsModalOpen(true);
      // Clear the state after opening the modal
      window.history.replaceState({}, document.title);
    }
    
    // Check if there's a new appointment to create from the calendar
    if (location.state?.newAppointment) {
      setNewAppointment(location.state.newAppointment);
      setEditingAppointment(null);
      setIsModalOpen(true);
      // Clear the state after opening the modal
      window.history.replaceState({}, document.title);
    }
  }, [location, fetchAppointments]);

  useEffect(() => {
    if (successMessage) {
      setIsHiding(false);
      const timer = setTimeout(() => {
        setIsHiding(true);
        setTimeout(() => {
          setSuccessMessage('');
        }, 300);
      }, 2000);
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
    setSuccessMessage('');
  };

  const handleDelete = async (appointment) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axiosInstance.delete(`/appointments/${appointment.id}/`);
        setSuccessMessage('Appointment was successfully deleted.');
        fetchAppointments(); // Updates the list after deletion
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Error deleting appointment. Please try again.');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) {
    return (
      <div>
        <h2>Error Loading Appointments</h2>
        <p>Error: {error.message}</p>
        <p>Check your network connection and authentication.</p>
      </div>
    );
  }

  return (
    <div className="appointments">
      <div className="appointments-header">
        <h2>Appointments</h2>
        <button className="new-appointment-btn" onClick={() => {
          setNewAppointment(null);
          setEditingAppointment(null);
          setIsModalOpen(true);
        }}>
          <FaPlus /> New Appointment
        </button>
      </div>

      {successMessage && (
        <div className={`success-message ${isHiding ? 'hide' : ''}`}>
          {successMessage}
        </div>
      )}

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div className="appointment-card" key={appointment.id}>
              <div className="appointment-header">
                <h3>{appointment.description}</h3>
              </div>
              <div className="appointment-body">
                <p>
                  <FaUserAlt /> Client: {appointment.clientName}
                </p>
                <p>
                  <FaRegCalendarAlt /> Date: {moment(appointment.date_hour).format('MMMM Do YYYY, h:mm A')}
                </p>
              </div>
              <div className="appointment-actions">
                <button className="edit-btn" onClick={() => handleEdit(appointment)}>
                  <FaEdit /> Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(appointment)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onAppointmentCreated={handleAppointmentUpdate}
        editingAppointment={editingAppointment}
        newAppointment={newAppointment}
      />
    </div>
  );
};

export default Appointments;
