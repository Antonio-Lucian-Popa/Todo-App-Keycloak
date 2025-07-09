import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const fetchedTodos = await apiService.getTodos();
      setTodos(fetchedTodos);
      setError(null);
    } catch (err) {
      setError('Failed to load todos');
      console.error('Error loading todos:', err);
      // For demo purposes, use mock data if API fails
      setTodos(mockTodos);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTodo = await apiService.createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      toast.success('Task created successfully!');
      return newTodo;
    } catch (err) {
      toast.error('Failed to create task');
      console.error('Error creating todo:', err);
      
      // For demo purposes, create mock todo
      const mockTodo: Todo = {
        id: Date.now().toString(),
        ...todoData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTodos(prev => [mockTodo, ...prev]);
      return mockTodo;
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await apiService.updateTodo(id, updates);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      toast.success('Task updated successfully!');
      return updatedTodo;
    } catch (err) {
      toast.error('Failed to update task');
      console.error('Error updating todo:', err);
      
      // For demo purposes, update local state
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo
      ));
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await apiService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success('Task deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete task');
      console.error('Error deleting todo:', err);
      
      // For demo purposes, delete from local state
      setTodos(prev => prev.filter(todo => todo.id !== id));
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const updatedTodo = await apiService.toggleTodoComplete(id);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      toast.success('Task updated successfully!');
    } catch (err) {
      toast.error('Failed to update task');
      console.error('Error toggling todo:', err);
      
      // For demo purposes, toggle local state
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: new Date() } : todo
      ));
    }
  };

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    refreshTodos: loadTodos,
  };
};

// Mock data for demo purposes
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the todo app project',
    completed: false,
    priority: 'high',
    category: 'work',
    dueDate: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, bread, eggs, and vegetables',
    completed: true,
    priority: 'medium',
    category: 'shopping',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Exercise routine',
    description: '30 minutes of cardio and strength training',
    completed: false,
    priority: 'low',
    category: 'health',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];