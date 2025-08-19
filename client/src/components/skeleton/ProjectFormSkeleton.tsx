import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProjectFormSkeleton: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0" duration={1.3}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
            {/* Header */}
            <div className="mb-8">
              <Skeleton height={32} width="60%" className="mb-2" />
              <Skeleton height={20} width="80%" />
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Nom du projet */}
              <div>
                <Skeleton height={20} width="25%" className="mb-2" />
                <Skeleton height={48} className="rounded-xl" />
              </div>

              {/* Description */}
              <div>
                <Skeleton height={20} width="30%" className="mb-2" />
                <Skeleton height={120} className="rounded-xl" />
              </div>

              {/* Status */}
              <div>
                <Skeleton height={20} width="20%" className="mb-2" />
                <Skeleton height={48} className="rounded-xl" />
              </div>

              {/* Date de fin */}
              <div>
                <Skeleton height={20} width="35%" className="mb-2" />
                <Skeleton height={48} className="rounded-xl" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <Skeleton height={48} width={120} className="rounded-xl" />
              <Skeleton height={48} width={100} className="rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default ProjectFormSkeleton;
