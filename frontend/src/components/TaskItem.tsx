'use client';

import { Task } from '@/types';
import { Edit, Trash2, Calendar, Flag, CheckCircle2, GripVertical } from 'lucide-react';
import { formatDate, getStatusColor, getPriorityColor, getDueDateColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: Task;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskToggle: (taskId: string) => void;
}

export default function TaskItem({ task, onTaskEdit, onTaskDelete, onTaskToggle }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg p-3 sm:p-4 transition-all hover:shadow-md",
        task.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300",
        isDragging ? "opacity-50 z-50" : ""
      )}
    >
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-2 flex-1">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing touch-manipulation"
              title="Drag to reorder"
            >
              <GripVertical className="w-3 h-3" />
            </button>

            {/* Checkbox */}
            <button
              onClick={() => onTaskToggle(task.id)}
              className={cn(
                "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer mt-0.5 touch-manipulation",
                task.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 hover:border-green-500"
              )}
            >
              {task.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-base font-medium leading-tight",
                task.completed ? "text-gray-500 line-through" : "text-gray-900"
              )}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={cn(
                  "mt-1 text-sm leading-tight",
                  task.completed ? "text-gray-400" : "text-gray-600"
                )}>
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={() => onTaskEdit(task)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer touch-manipulation"
              title="Edit task"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskDelete(task.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer touch-manipulation"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            getStatusColor(task.status)
          )}>
            {task.status.replace('_', ' ')}
          </span>

          {/* Priority Badge */}
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            getPriorityColor(task.priority)
          )}>
            <Flag className="w-2.5 h-2.5 mr-1" />
            {task.priority}
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <span className={cn(
              "inline-flex items-center text-xs",
              getDueDateColor(task.dueDate, task.completed)
            )}>
              <Calendar className="w-2.5 h-2.5 mr-1" />
              Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-1 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            {/* Checkbox */}
            <button
              onClick={() => onTaskToggle(task.id)}
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer mt-1",
                task.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 hover:border-green-500"
              )}
            >
              {task.completed && <CheckCircle2 className="w-3 h-3" />}
            </button>
            
            <div className="flex-1">
              <h3 className={cn(
                "text-lg font-medium",
                task.completed ? "text-gray-500 line-through" : "text-gray-900"
              )}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={cn(
                  "mt-1 text-sm",
                  task.completed ? "text-gray-400" : "text-gray-600"
                )}>
                  {task.description}
                </p>
              )}

              <div className="flex items-center space-x-4 mt-3">
                {/* Status Badge */}
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  getStatusColor(task.status)
                )}>
                  {task.status.replace('_', ' ')}
                </span>

                {/* Priority Badge */}
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  getPriorityColor(task.priority)
                )}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority}
                </span>

                {/* Due Date */}
                {task.dueDate && (
                  <span className={cn(
                    "inline-flex items-center text-xs",
                    getDueDateColor(task.dueDate, task.completed)
                  )}>
                    <Calendar className="w-3 h-3 mr-1" />
                    Due {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onTaskEdit(task)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Edit task"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onTaskDelete(task.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
