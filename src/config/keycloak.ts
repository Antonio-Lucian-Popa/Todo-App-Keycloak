import { KeycloakConfig } from '@/types/auth';
import { VITE_API_URL, VITE_KEYCLOAK_CLIENT_ID, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_URL, VITE_REDIRECT_URI } from '@/utils/constants';

// Remove custom ImportMetaEnv and ImportMeta interfaces to use Vite's built-in types.

export const keycloakConfig: KeycloakConfig = {
  url: VITE_KEYCLOAK_URL,
  realm: VITE_KEYCLOAK_REALM,
  clientId: VITE_KEYCLOAK_CLIENT_ID,
  redirectUri: VITE_REDIRECT_URI
};

export const apiConfig = {
  baseURL: VITE_API_URL,
  endpoints: {
    userProfile: '/users/profile',
    userComplete: '/users/complete',
    todos: '/todos'
  }
};