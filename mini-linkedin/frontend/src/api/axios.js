import axios from 'axios';

const API = axios.create({
    baseURL: 'https://mini-linkedin-09s6.onrender.com/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('ml_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default API;
