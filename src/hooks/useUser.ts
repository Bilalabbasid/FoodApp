import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import api from '../utils/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'staff' | 'manager' | 'admin' | 'rider';
  isVerified: boolean;
  addresses?: any[];
  favorites?: any[];
  preferences?: any;
}

export const useUser = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async (userId?: string) => {
    if (!isAuthenticated && !userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.users.getProfile(userId);
      setProfile(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updateData: Partial<User>, userId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.users.updateProfile(updateData, userId);
      setProfile(response.data.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Address management
  const addresses = {
    get: async (userId?: string) => {
      try {
        const response = await api.users.getAddresses(userId);
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch addresses');
        throw err;
      }
    },

    add: async (addressData: any) => {
      try {
        const response = await api.users.addAddress(addressData);
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to add address');
        throw err;
      }
    },

    update: async (addressId: string, addressData: any) => {
      try {
        const response = await api.users.updateAddress(addressId, addressData);
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update address');
        throw err;
      }
    },

    delete: async (addressId: string) => {
      try {
        const response = await api.users.deleteAddress(addressId);
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete address');
        throw err;
      }
    },
  };

  // Favorites management
  const favorites = {
    get: async (userId?: string) => {
      try {
        const response = await api.users.getFavorites(userId);
        return response.data.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch favorites');
        throw err;
      }
    },

    toggle: async (itemId: string) => {
      try {
        const response = await api.users.toggleFavorite(itemId);
        return response.data;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to toggle favorite');
        throw err;
      }
    },
  };

  // Get user orders
  const getOrders = async (params?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const response = await api.users.getOrders(params);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      throw err;
    }
  };

  // Admin only: Get all users
  const getAllUsers = async (params?: {
    role?: string;
    isVerified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    if (!user || !['admin', 'manager'].includes(user.role)) {
      throw new Error('Unauthorized: Admin/Manager access required');
    }

    try {
      const response = await api.users.getAll(params);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      throw err;
    }
  };

  // Check user permissions
  const hasPermission = (requiredRoles: string[], userId?: string) => {
    if (!user) return false;

    // User can access their own data
    if (userId && userId === user._id) return true;

    // Check role-based permissions
    return requiredRoles.includes(user.role);
  };

  // Initialize profile fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    addresses,
    favorites,
    getOrders,
    getAllUsers,
    hasPermission,
    // Computed properties
    isCustomer: user?.role === 'customer',
    isStaff: user?.role === 'staff',
    isManager: user?.role === 'manager',
    isAdmin: user?.role === 'admin',
    isRider: user?.role === 'rider',
    canManageStore: user ? ['admin', 'manager'].includes(user.role) : false,
    canViewKitchen: user ? ['admin', 'manager', 'staff'].includes(user.role) : false,
    canManageRiders: user ? ['admin', 'manager'].includes(user.role) : false,
  };
};
