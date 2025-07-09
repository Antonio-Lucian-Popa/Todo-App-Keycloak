import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { AuthTokens, User, KeycloakConfig, LoginCredentials, RegisterData } from '@/types/auth';
import { keycloakConfig } from '@/config/keycloak';

class KeycloakService {
  private axiosInstance: AxiosInstance;
  private adminAxiosInstance: AxiosInstance;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor(private config: KeycloakConfig) {
    this.axiosInstance = axios.create({
      baseURL: `${config.url}/realms/${config.realm}/protocol/openid-connect`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // For admin operations (user registration)
    this.adminAxiosInstance = axios.create({
      baseURL: `${config.url}/admin/realms/${config.realm}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Redirect user to Keycloak login page with Google provider hint
   */
  loginWithGoogle(): void {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      kc_idp_hint: 'google', // Direct to Google provider
    });

    const loginUrl = `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/auth?${params}`;
    window.location.href = loginUrl;
  }

  /**
   * Manual login with username and password
   */
  async loginWithCredentials(credentials: LoginCredentials): Promise<AuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: this.config.clientId,
      username: credentials.username,
      password: credentials.password,
      scope: 'openid email profile',
    });

    try {
      const response = await this.axiosInstance.post('/token', params);
      const tokens: AuthTokens = response.data;
      this.storeTokens(tokens);
      return tokens;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  /**
   * Register new user manually
   */
  async registerUser(userData: RegisterData): Promise<void> {
    // First, get admin token (you'll need to configure this in your Keycloak)
    // For production, this should be done through your backend API
    const adminToken = await this.getAdminToken();
    
    const keycloakUser = {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      enabled: true,
      emailVerified: false,
      credentials: [
        {
          type: 'password',
          value: userData.password,
          temporary: false,
        },
      ],
    };

    try {
      await this.adminAxiosInstance.post('/users', keycloakUser, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('User already exists');
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  /**
   * Get admin token for user management operations
   * In production, this should be handled by your backend
   */
  private async getAdminToken(): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: 'admin-cli', // You need to configure this in Keycloak
      client_secret: import.meta.env.VITE_KEYCLOAK_ADMIN_SECRET || '',
    });

    const response = await axios.post(
      `${this.config.url}/realms/master/protocol/openid-connect/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<AuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code,
      redirect_uri: this.config.redirectUri,
    });

    const response = await this.axiosInstance.post('/token', params);
    const tokens: AuthTokens = response.data;
    
    this.storeTokens(tokens);
    return tokens;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthTokens> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const tokens = await this.refreshPromise;
      this.storeTokens(tokens);
      return tokens;
    } catch (error) {
      this.clearTokens();
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<AuthTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      refresh_token: refreshToken,
    });

    const response = await this.axiosInstance.post('/token', params);
    return response.data;
  }

  /**
   * Get user information from token
   */
  async getUserInfo(accessToken: string): Promise<User> {
    const response = await this.axiosInstance.get('/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      try {
        const params = new URLSearchParams({
          client_id: this.config.clientId,
          refresh_token: refreshToken,
        });

        await this.axiosInstance.post('/logout', params);
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    this.clearTokens();
    
    // Redirect to Keycloak logout
    const logoutUrl = `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(this.config.redirectUri)}`;
    window.location.href = logoutUrl;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return Cookies.get('access_token') || null;
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    return Cookies.get('refresh_token') || null;
  }

  /**
   * Store tokens securely
   */
  private storeTokens(tokens: AuthTokens): void {
    const expiresInDays = tokens.expires_in / (24 * 60 * 60);
    
    Cookies.set('access_token', tokens.access_token, {
      expires: expiresInDays,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
    });

    Cookies.set('refresh_token', tokens.refresh_token, {
      expires: 30, // 30 days
      secure: import.meta.env.PROD,
      sameSite: 'strict',
    });
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }

  /**
   * Get authenticated axios instance with automatic token refresh
   */
  getAuthenticatedAxios(): AxiosInstance {
    const instance = axios.create();

    // Request interceptor to add token
    instance.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const newToken = this.getAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }
}

export const keycloakService = new KeycloakService(keycloakConfig);