import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trello_user');
    if (token) {
      try {
        const user = JSON.parse(token);
        config.headers['Authorization'] = `Bearer ${user.id}`;
      } catch (error) {
        console.error('Error parsing user token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trello_user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default api;
