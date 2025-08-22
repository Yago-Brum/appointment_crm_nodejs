import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/API/auth/login/`, { username, password });
      login(response.data.access);
      navigate('/dashboard');
    } catch (error) {
      handleError(error);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/API/auth/register/`, { username, password, email });
      alert('Registration successful! Please log in.');
      setIsRegistering(false);
    } catch (error) {
      handleError(error);
    }
  };
  

  const handleError = (error) => {
    if (error.response && error.response.data) {
      setError(error.response.data.detail || error.response.data.non_field_errors?.[0] || 'Registration/Login failed.');
    } else {
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-image-section">
        <div className="login-image-content">
          <h1>Welcome to Appointment CRM</h1>
          <p>Streamline your appointment management with our professional CRM solution. Organize, schedule, and manage your client appointments efficiently.</p>
        </div>
      </div>
      <div className="login-form-section">
        <div className="login-box">
          <h2 className="login-title">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="Enter your username"
              />
            </div>
            {isRegistering && (
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email"
                />
              </div>
            )}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Enter your password"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="switch-button"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
