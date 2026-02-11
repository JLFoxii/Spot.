import axios from 'axios';

// URL de base (à mettre dans .env.local plus tard: NEXT_PUBLIC_API_URL)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur : Ajoute le token à chaque requête sortante
apiClient.interceptors.request.use((config) => {
  // On récupère le token du LocalStorage (approche simple pour le MVP)
  const token = typeof window !== 'undefined' ? localStorage.getItem('spot_token') : null;
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : Gère les erreurs 401 (Token expiré)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirection vers login ou refresh token
      if (typeof window !== 'undefined') {
         // window.location.href = '/login'; // Décommenter quand la page login existe
         console.error("Session expirée");
      }
    }
    return Promise.reject(error);
  }
);
