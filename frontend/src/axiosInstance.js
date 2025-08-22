import axios from 'axios';


const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/API',  // Usando a variável de ambiente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionando o token aos headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Obtendo o token do localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Adicionando o token aos headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors and redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token
      localStorage.removeItem('token');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
