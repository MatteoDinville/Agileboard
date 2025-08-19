import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BacklogSkeleton: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.3}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Skeleton height={28} width="30%" className="mb-2" />
          <Skeleton height={16} width="50%" />
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Skeleton height={40} width={120} className="rounded-lg" />
          <Skeleton height={40} width={100} className="rounded-lg" />
          <Skeleton height={40} width={140} className="rounded-lg" />
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Skeleton height={20} width="70%" className="mb-2" />
                  <Skeleton height={16} width="90%" />
                </div>
                <Skeleton height={24} width={80} className="rounded-full" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton circle height={24} width={24} />
                  <Skeleton height={14} width={80} />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton height={16} width={60} />
                  <Skeleton height={16} width={40} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Task Button */}
        <div className="mt-6">
          <Skeleton height={48} width={180} className="rounded-xl" />
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default BacklogSkeleton;
