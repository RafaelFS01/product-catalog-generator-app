
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-8 w-full max-w-sm mb-4" />
        <Skeleton className="h-32 w-full mb-2" />
        <Skeleton className="h-32 w-full mb-2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
