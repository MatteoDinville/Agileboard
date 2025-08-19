import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const UserSearchSkeleton: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.1}>
      <div className="py-6">
        {/* Search result items */}
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Skeleton circle height={32} width={32} />
                
                {/* User Info */}
                <div>
                  <Skeleton height={16} width={100} className="mb-1" />
                  <Skeleton height={12} width={150} />
                </div>
              </div>
              
              {/* Add button */}
              <Skeleton height={32} width={70} className="rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default UserSearchSkeleton;
