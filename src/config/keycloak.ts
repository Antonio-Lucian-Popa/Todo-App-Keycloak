import { KeycloakConfig } from '@/types/auth';

export const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'todo-app',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'todo-frontend',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin
};

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  endpoints: {
    userProfile: '/users/profile',
    userComplete: '/users/complete',
    todos: '/todos'
  }
};