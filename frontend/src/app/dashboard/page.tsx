'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Task, UserStats } from '@/types';
import { tasksAPI, usersAPI } from '@/lib/api';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import Header from '@/components/Header';
import StatsCards from '@/components/StatsCards';
import TaskFilters from '@/components/TaskFilters';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    completed: undefined as boolean | undefined,
    search: '',
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce filters to prevent excessive API calls during typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          setLoading(true);
          const fetchedTasks = await tasksAPI.getTasks(debouncedFilters);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error('Failed to load tasks:', error);
          // Only show error if it's not a 401 (auth error) as that's handled by interceptor
          if ((error as { response?: { status?: number } })?.response?.status !== 401) {
            toast.error('Failed to load tasks');
          }
        } finally {
          setLoading(false);
        }
        
        try {
          const fetchedStats = await usersAPI.getStats();
          setStats(fetchedStats);
        } catch (error) {
          console.error('Failed to load stats:', error);
          if ((error as { response?: { status?: number } })?.response?.status !== 401) {
            toast.error('Failed to load statistics');
          }
        }
      };
      loadData();
    }
  }, [isAuthenticated, debouncedFilters]);

  const loadStats = async () => {
    try {
      const fetchedStats = await usersAPI.getStats();
      setStats(fetchedStats);
    } catch {
      toast.error('Failed to load statistics');
    }
  };

  const handleTaskCreated = (task: Task) => {
    setTasks([task, ...tasks]);
    setShowTaskForm(false);
    loadStats();
    toast.success('Task created successfully!');
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
    loadStats();
    toast.success('Task updated successfully!');
  };

  const handleTasksReorder = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  const handleTaskDeleted = async (taskId: string) => {
    try {
      await tasksAPI.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      loadStats();
      toast.success('Task deleted successfully!');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleTaskToggled = async (taskId: string) => {
    try {
      const updatedTask = await tasksAPI.toggleTask(taskId);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      loadStats();
      toast.success('Task status updated!');
    } catch {
      toast.error('Failed to update task status');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} />}

        {/* Main Content */}
        <div className="mt-6 sm:mt-8 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <TaskFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Tasks Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Tasks ({tasks.length})
                  </h2>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <TaskList
                    tasks={tasks}
                    onTaskEdit={setEditingTask}
                    onTaskDelete={handleTaskDeleted}
                    onTaskToggle={handleTaskToggled}
                    onTasksReorder={handleTasksReorder}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
