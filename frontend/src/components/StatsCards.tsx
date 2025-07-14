'use client';

import { UserStats } from '@/types';
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface StatsCardsProps {
  stats: UserStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="flex flex-row gap-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.completedTasks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.overdueTasks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.completionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
