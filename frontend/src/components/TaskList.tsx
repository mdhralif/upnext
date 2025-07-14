'use client';

import { Task } from '@/types';
import { CheckCircle2 } from 'lucide-react';
import { tasksAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskToggle: (taskId: string) => void;
  onTasksReorder: (tasks: Task[]) => void;
}

export default function TaskList({ 
  tasks, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskToggle, 
  onTasksReorder 
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      
      // Update local state immediately for smooth UX
      onTasksReorder(reorderedTasks);

      // Create the task orders array with new sortOrder values
      const taskOrders = reorderedTasks.map((task, index) => ({
        id: task.id,
        sortOrder: index,
      }));

      try {
        await tasksAPI.reorderTasks(taskOrders);
        toast.success('Tasks reordered successfully');
      } catch (error) {
        console.error('Reorder error:', error);
        toast.error('Failed to reorder tasks');
        // Revert the change if API call fails
        onTasksReorder(tasks);
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
          <CheckCircle2 className="w-full h-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-500">Get started by creating your first task!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
              onTaskToggle={onTaskToggle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
