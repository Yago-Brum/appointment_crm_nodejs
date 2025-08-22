// Clients.js
import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../axiosInstance';
import { FaUserAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './Clients.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isHiding, setIsHiding] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/clients/');
      setClients(response.data);
    } catch (error) {
      setError('Failed to load clients. Please try again later.');
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || ''
    });
    setFormError('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      try {
        await axiosInstance.delete(`/clients/${client.id}/`);
        setSuccessMessage(`${client.name} was successfully deleted.`);
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        setError('Failed to delete client. Please try again.');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    setFormError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      setFormError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      if (editingClient) {
        await axiosInstance.put(`/clients/${editingClient.id}/`, formData);
        handleModalClose();
        setSuccessMessage(`${formData.name} was successfully updated.`);
        fetchClients();
      } else {
        await axiosInstance.post('/clients/', formData);
        handleModalClose();
        setSuccessMessage(`${formData.name} was successfully created.`);
        fetchClients();
      }
    } catch (error) {
      console.error('Error saving client:', error);
      if (error.response?.data) {
        const errorMessages = Object.entries(error.response.data).map(([field, message]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
          return `${fieldName}: ${message}`;
        });
        setFormError(errorMessages.join('\n'));
      } else {
        setFormError('Failed to save client. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  if (loading) return <div className="loading">Loading clients...</div>;

  return (
    <div className="clients">
      <h2>Clients</h2>
      <div className="clients-content">
        <div className="clients-header">
          <button className="new-client-btn" onClick={() => {
            setFormData({ name: '', email: '', phone: '' });
            setFormError('');
            setSuccessMessage('');
            setIsModalOpen(true);
          }}>
            <FaPlus /> New Client
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {successMessage && (
          <div className={`success-message ${isHiding ? 'hide' : ''}`}>
            {successMessage}
          </div>
        )}

        {clients.length === 0 ? (
          <p className="no-clients">No clients found. Click "New Client" to add your first client.</p>
        ) : (
          <div className="clients-list">
            {clients.map((client) => (
              <div className="client-card" key={client.id}>
                <div className="client-header">
                  <h3>{client.name}</h3>
                </div>
                <div className="client-body">
                  <p>
                    <FaUserAlt /> Email: {client.email || 'Not provided'}
                  </p>
                  <p>Phone: {client.phone || 'Not provided'}</p>
                </div>
                <div className="client-actions">
                  <button className="edit-btn" onClick={() => handleEdit(client)}>
                    <FaEdit /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(client)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingClient ? 'Edit Client' : 'New Client'}</h2>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name: <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email: <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter client email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter client phone"
                />
              </div>

              <div className="required-fields-note">
                <span className="required">*</span> Required fields
              </div>

              <div className="modal-buttons">
                <button type="submit" className="save-btn">
                  {editingClient ? 'Update client' : 'Create client'}
                </button>
                <button type="button" onClick={handleModalClose} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
