import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Todo, TodoFilters } from '@/types/todo';
import { Plus, Search, Filter, Calendar, AlertCircle } from 'lucide-react';
import { TodoDialog } from './TodoDialog';
import { cn } from '@/lib/utils';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodo: (id: string, todo: Partial<Todo>) => void;
  onCreateTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleComplete,
  onDeleteTodo,
  onUpdateTodo,
  onCreateTodo,
}) => {
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>(todos);
  const [filters, setFilters] = useState<TodoFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    let filtered = todos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(todo => todo.category === filters.category);
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }

    // Filter by completion status
    if (filters.completed !== undefined) {
      filtered = filtered.filter(todo => todo.completed === filters.completed);
    }

    setFilteredTodos(filtered);
  }, [todos, filters, searchTerm]);

  const handleCreateTodo = (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    onCreateTodo(todo);
    setIsDialogOpen(false);
  };

  const handleUpdateTodo = (todo: Partial<Todo>) => {
    if (editingTodo) {
      onUpdateTodo(editingTodo.id, todo);
      setEditingTodo(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckSquare className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount - completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Tasks</CardTitle>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.category || ''}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value || undefined }))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority || ''}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value as any || undefined }))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Todo Items */}
          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks found. Start by creating your first task!</p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-start space-x-3 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer",
                    todo.completed && "opacity-60"
                  )}
                  onClick={() => setEditingTodo(todo)}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => onToggleComplete(todo.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "text-sm font-medium text-gray-900",
                        todo.completed && "line-through"
                      )}>
                        {todo.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(todo.priority)}>
                          {todo.priority}
                        </Badge>
                        <Badge variant="outline">
                          {todo.category}
                        </Badge>
                      </div>
                    </div>
                    {todo.description && (
                      <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                    )}
                    {todo.dueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <TodoDialog
        open={isDialogOpen || editingTodo !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingTodo(null);
          }
        }}
        todo={editingTodo}
        onSave={editingTodo ? handleUpdateTodo : handleCreateTodo}
        onDelete={editingTodo ? () => onDeleteTodo(editingTodo.id) : undefined}
      />
    </div>
  );
};