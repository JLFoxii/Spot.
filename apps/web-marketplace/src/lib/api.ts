import axios from 'axios';

// URL de base API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('spot_token_client');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Pour les appels server-side (dans les Server Components)
export const serverApiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // URL interne pour le serveur
  headers: {
    'Content-Type': 'application/json',
  },
});
