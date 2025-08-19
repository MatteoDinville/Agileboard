import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const KanbanBoardSkeleton: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.4}>
      <div className="p-6 bg-gradient-to-br from-slate-50 to-white">
        {/* Header */}
        <div className="mb-6">
          <Skeleton height={28} width="40%" className="mb-2" />
          <Skeleton height={16} width="60%" />
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, columnIndex) => (
            <div key={columnIndex} className="bg-white/60 rounded-xl p-4 border border-gray-100">
              {/* Column Header */}
              <div className="mb-4">
                <Skeleton height={20} width="70%" className="mb-1" />
                <Skeleton height={14} width="30%" />
              </div>

              {/* Task Cards */}
              <div className="space-y-3">
                {[...Array(columnIndex === 0 ? 4 : columnIndex === 1 ? 3 : columnIndex === 2 ? 2 : 1)].map((_, cardIndex) => (
                  <div key={cardIndex} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    {/* Task Title */}
                    <Skeleton height={16} width="90%" className="mb-2" />
                    
                    {/* Task Description */}
                    <Skeleton height={12} width="100%" className="mb-3" />
                    <Skeleton height={12} width="80%" className="mb-3" />
                    
                    {/* Priority and Assignee */}
                    <div className="flex items-center justify-between">
                      <Skeleton height={20} width={60} className="rounded-full" />
                      <Skeleton circle height={24} width={24} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Task Button Area */}
              <div className="mt-4">
                <Skeleton height={32} width="100%" className="rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button Area */}
        <div className="fixed bottom-6 right-6">
          <Skeleton circle height={56} width={56} />
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default KanbanBoardSkeleton;
