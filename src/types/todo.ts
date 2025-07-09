export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoFilters {
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  search?: string;
}

export type TodoSortBy = 'title' | 'dueDate' | 'priority' | 'createdAt';
export type SortOrder = 'asc' | 'desc';