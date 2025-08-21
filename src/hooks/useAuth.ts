import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';

export const useAuth = () => {
  const { user, setUser, setLoading, isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: api.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    setLoading(isLoading);
    
    if (data?.success && data.data?.user) {
      setUser(data.data.user);
    } else if (error) {
      setUser(null);
    }
  }, [data, error, isLoading, setUser, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error
  };
};