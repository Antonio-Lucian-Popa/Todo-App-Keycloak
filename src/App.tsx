import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserOnboarding } from '@/components/auth/UserOnboarding';
import { Header } from '@/components/layout/Header';
import { TodoList } from '@/components/todo/TodoList';
import { Toaster } from '@/components/ui/toaster';
import { useTodos } from '@/hooks/useTodos';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const TodoApp: React.FC = () => {
  const { user } = useAuth();
  const { todos, loading, createTodo, updateTodo, deleteTodo, toggleComplete } = useTodos();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // For demo purposes, show onboarding if user lacks additional info
  // In real app, check if user profile is complete from backend
  React.useEffect(() => {
    if (user && !user.given_name) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (showOnboarding) {
    return <UserOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TodoList
          todos={todos}
          onToggleComplete={toggleComplete}
          onDeleteTodo={deleteTodo}
          onUpdateTodo={updateTodo}
          onCreateTodo={createTodo}
        />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TodoApp />
      </ProtectedRoute>
      <Toaster />
    </AuthProvider>
  );
}

export default App;