import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';
import moment from 'moment';

const NewAppointmentModal = ({ isOpen, onClose, onAppointmentCreated, editingAppointment, newAppointment, successMessage, setSuccessMessage }) => {
  const [description, setDescription] = useState('');
  const [dateHour, setDateHour] = useState('');
  const [client, setClient] = useState('');
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axiosInstance.get('/clients/');
        setClients(response.data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load clients. Please try again.');
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (editingAppointment) {
      setDescription(editingAppointment.description);
      setDateHour(moment(editingAppointment.date_hour).format('YYYY-MM-DDTHH:mm'));
      setClient(editingAppointment.client);
    } else if (newAppointment) {
      setDescription(newAppointment.description);
      setDateHour(moment(newAppointment.date_hour).format('YYYY-MM-DDTHH:mm'));
      setClient('');
    } else {
      setDescription('');
      setDateHour('');
      setClient('');
    }
    setError(''); // Clear any previous errors
  }, [editingAppointment, newAppointment, isOpen]);

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
  }, [successMessage, setSuccessMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const appointmentData = {
        description,
        date_hour: moment(dateHour).toISOString(),
        client,
      };

      if (editingAppointment) {
        await axiosInstance.put(`/appointments/${editingAppointment.id}/`, appointmentData);
        await onAppointmentCreated(); // This will handle the update and modal closing
      } else {
        await axiosInstance.post('/appointments/', appointmentData);
        await onAppointmentCreated(); // This will handle the update and modal closing
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      if (error.response && error.response.data) {
        // Handle specific error messages from the backend
        const errorData = error.response.data;
        if (errorData.date_hour) {
          setError(errorData.date_hour);
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('Failed to save appointment. Please check your input and try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</h2>
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className={`success-message ${isHiding ? 'hide' : ''}`}>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description <span className="required">*</span>:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter appointment description"
            />
          </div>

          <div className="form-group">
            <label>Date & Time <span className="required">*</span>:</label>
            <input
              type="datetime-local"
              value={dateHour}
              onChange={(e) => setDateHour(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Client <span className="required">*</span>:</label>
            <select value={client} onChange={(e) => setClient(e.target.value)} required>
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="required-fields-note">
            <span className="required">*</span> Required fields
          </div>

          <div className="modal-buttons">
            <button type="submit" className="edit-btn">
              {editingAppointment ? 'Update appointment' : 'Create appointment'}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
