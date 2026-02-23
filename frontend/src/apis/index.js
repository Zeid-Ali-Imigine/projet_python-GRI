import axios from 'axios';

// Configuration de base pour Axios
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token d'authentification si disponible
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Endpoints API regroupés par entité
export const authAPI = {
    login: (credentials) => api.post('token/', credentials),
    getProfile: () => api.get('utilisateurs/me/'),
};

export const biensAPI = {
    getAll: () => api.get('biens/'),
    getById: (id) => api.get(`biens/${id}/`),
    create: (data) => api.post('biens/', data),
    update: (id, data) => api.put(`biens/${id}/`, data),
    delete: (id) => api.delete(`biens/${id}/`),
};

export const demandesAPI = {
    getAll: () => api.get('demandes/'),
    create: (data) => api.post('demandes/', data),
    accepter: (id) => api.post(`demandes/${id}/accepter/`),
    refuser: (id) => api.post(`demandes/${id}/refuser/`),
};

export const bauxAPI = {
    getAll: () => api.get('baux/'),
    create: (data) => api.post('baux/', data),
};

export const paiementsAPI = {
    getAll: () => api.get('paiements/'),
    create: (data) => api.post('paiements/', data),
    valider: (id) => api.post(`paiements/${id}/valider/`),
    refuser: (id) => api.post(`paiements/${id}/refuser/`),
    getStats: () => api.get('paiements/statistiques/'),
};

export const chargesAPI = {
    getAll: () => api.get('charges/'),
    create: (data) => api.post('charges/', data),
};

export const utilisateursAPI = {
    getAll: () => api.get('utilisateurs/'),
    delete: (id) => api.delete(`utilisateurs/${id}/`),
    bloquer: (id) => api.post(`utilisateurs/${id}/bloquer/`),
    debloquer: (id) => api.post(`utilisateurs/${id}/debloquer/`),
    getMe: () => api.get('utilisateurs/me/'),
};

export default api;
