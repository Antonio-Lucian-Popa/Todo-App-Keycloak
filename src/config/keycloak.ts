import { KeycloakConfig } from '@/types/auth';

// Remove custom ImportMetaEnv and ImportMeta interfaces to use Vite's built-in types.

export const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://antonio-dev.go.ro:8081/keycloak-app',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'todo-app-realm',
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