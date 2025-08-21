import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full',
  rounded = false 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${height} ${width} ${
        rounded ? 'rounded-full' : 'rounded'
      } ${className}`}
    />
  );
};

export const MenuItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <Skeleton height="h-48" className="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton height="h-6" width="w-3/4" />
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-2/3" />
        <div className="flex justify-between items-center">
          <Skeleton height="h-5" width="w-16" />
          <Skeleton height="h-8" width="w-20" rounded />
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-4">
      <Skeleton height="h-16" width="w-16" rounded />
      <Skeleton height="h-4" width="w-20" className="mt-2" />
    </div>
  );
};
