import { keycloakService } from './keycloak';
import { apiConfig } from '@/config/keycloak';
import { User, AdditionalUserInfo } from '@/types/auth';
import { Todo, TodoFilters } from '@/types/todo';

class ApiService {
  private api = keycloakService.getAuthenticatedAxios();

  constructor() {
    this.api.defaults.baseURL = apiConfig.baseURL;
  }

  // User management
  async getUserProfile(): Promise<User> {
    const response = await this.api.get(apiConfig.endpoints.userProfile);
    return response.data;
  }

  async completeUserProfile(additionalInfo: AdditionalUserInfo): Promise<User> {
    const response = await this.api.post(apiConfig.endpoints.userComplete, additionalInfo);
    return response.data;
  }

  // Todo management
  async getTodos(filters?: TodoFilters): Promise<Todo[]> {
    const params = filters ? { params: filters } : {};
    const response = await this.api.get(apiConfig.endpoints.todos, params);
    return response.data;
  }

  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const response = await this.api.post(apiConfig.endpoints.todos, todo);
    return response.data;
  }

  async updateTodo(id: string, todo: Partial<Todo>): Promise<Todo> {
    const response = await this.api.put(`${apiConfig.endpoints.todos}/${id}`, todo);
    return response.data;
  }

  async deleteTodo(id: string): Promise<void> {
    await this.api.delete(`${apiConfig.endpoints.todos}/${id}`);
  }

  async toggleTodoComplete(id: string): Promise<Todo> {
    const response = await this.api.patch(`${apiConfig.endpoints.todos}/${id}/toggle`);
    return response.data;
  }
}

export const apiService = new ApiService();