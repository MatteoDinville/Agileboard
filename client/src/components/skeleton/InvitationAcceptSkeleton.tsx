import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const InvitationAcceptSkeleton: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.4}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          {/* Icon placeholder */}
          <div className="flex justify-center mb-4">
            <Skeleton circle height={48} width={48} />
          </div>
          
          {/* Title */}
          <Skeleton height={28} width="80%" className="mb-4" />
          
          {/* Content */}
          <div className="space-y-3">
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="90%" />
            <Skeleton height={20} width="95%" />
          </div>
          
          {/* Button area */}
          <div className="mt-6">
            <Skeleton height={48} width="100%" className="rounded-xl" />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default InvitationAcceptSkeleton;
