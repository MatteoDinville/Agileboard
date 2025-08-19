import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProjectMembersSkeleton: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.2}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Skeleton height={24} width="40%" className="mb-2" />
          <Skeleton height={16} width="60%" />
        </div>

        {/* Members Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white/60 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Skeleton circle height={40} width={40} />
                
                {/* User Info */}
                <div className="flex-1">
                  <Skeleton height={18} width="80%" className="mb-1" />
                  <Skeleton height={14} width="60%" />
                </div>
                
                {/* Role badge */}
                <Skeleton height={24} width={60} className="rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Add Member Section */}
        <div className="mt-8 p-4 bg-white/40 rounded-xl border border-gray-100">
          <Skeleton height={20} width="50%" className="mb-4" />
          <div className="flex gap-3">
            <Skeleton height={40} className="flex-1 rounded-lg" />
            <Skeleton height={40} width={100} className="rounded-lg" />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default ProjectMembersSkeleton;
