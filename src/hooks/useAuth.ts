import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';

export const useAuth = () => {
  const { user, setUser, setLoading, isAuthenticated } = useAuthStore();

  // Only fetch current user if we might be authenticated (have stored auth state or cookies)
  const shouldFetchUser = useCallback(() => {
    // Check if we have stored user state
    if (isAuthenticated) return true;
    
    // Check if we have auth cookies (for automatic login)
    return document.cookie.includes('accessToken') || document.cookie.includes('refreshToken');
  }, [isAuthenticated]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: shouldFetchUser(), // Only run query when we might be authenticated
  });

  useEffect(() => {
    setLoading(isLoading);
    
    if (data?.success && data.data?.user) {
      setUser(data.data.user);
    } else if (error && shouldFetchUser()) {
      // Only clear user if we expected to be authenticated
      setUser(null);
    }
  }, [data, error, isLoading, setUser, setLoading, shouldFetchUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error
  };
};