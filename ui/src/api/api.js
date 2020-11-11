import axios from 'axios';

const API_URL = 'http://localhost:9000/';

const api = axios.create({
    baseURL: API_URL
});

export default api;